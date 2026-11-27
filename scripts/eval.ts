import { generateText } from "ai";
import { getAiConfig } from "../lib/ai/config";
import { buildInstructions } from "../lib/ai/prompt";
import { resolveLanguageModel } from "../lib/ai/models";
import { bookAppointment, clearAppointments } from "../lib/appointments/book";
import { loadChunks } from "../lib/knowledge/chunk";
import { listServiceCities } from "../lib/knowledge/cities";
import { loadDocuments } from "../lib/knowledge/load";
import { rankByKeywords, retrieve } from "../lib/knowledge/retrieve";

type Case = {
  id: string;
  question: string;
  sources: string[];
  expect: string[];
  forbid?: string[];
};

const cases: Case[] = [
  {
    id: "cities",
    question: "Which cities do you serve?",
    sources: ["service-area.md"],
    expect: ["Irvine", "Anaheim"],
  },
  {
    id: "diagnostic",
    question: "How much does a weekday diagnostic visit cost?",
    sources: ["pricing.md"],
    expect: ["$89"],
  },
  {
    id: "comfort-club",
    question: "What is included in the Comfort Club maintenance plan?",
    sources: ["services.md"],
    expect: ["$189", "15%"],
  },
  {
    id: "saturday-hours",
    question: "What are your business hours on Saturday?",
    sources: ["hours.md"],
    expect: ["Saturday", "8:00"],
  },
  {
    id: "gas",
    question: "I smell gas in my house. Can you send a technician right now?",
    sources: ["emergency.md"],
    expect: ["911"],
    forbid: ["technician is on the way", "visit is confirmed"],
  },
  {
    id: "warranty",
    question: "What warranty comes with a new system install?",
    sources: ["warranty.md"],
    expect: ["2 year", "10 year"],
  },
  {
    id: "financing",
    question: "Do you offer financing on a new air conditioner?",
    sources: ["financing.md"],
    expect: ["0%", "Pacific Comfort"],
  },
  {
    id: "ducts",
    question: "How much is duct cleaning for a typical single-story home?",
    sources: ["pricing.md"],
    expect: ["$449"],
  },
  {
    id: "cancel",
    question: "How far ahead do I need to cancel an appointment?",
    sources: ["booking.md"],
    expect: ["24"],
  },
  {
    id: "solar",
    question: "Can you install rooftop solar panels?",
    sources: ["faqs.md", "services.md"],
    expect: ["do not install solar", "don't install solar"],
  },
  {
    id: "rebate",
    question: "What is the exact dollar amount of the current Edison heat pump rebate?",
    sources: ["faqs.md"],
    expect: ["do not publish", "don't publish"],
  },
];

const failures: string[] = [];

function fail(message: string) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

function pass(message: string) {
  console.log(`ok   ${message}`);
}

function includesAny(haystack: string, needles: string[]) {
  const lower = haystack.toLowerCase();
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

function runOffline() {
  const docs = loadDocuments();
  const names = new Set(docs.map((doc) => doc.source));
  for (const required of [
    "services.md",
    "pricing.md",
    "service-area.md",
    "hours.md",
    "emergency.md",
    "warranty.md",
    "financing.md",
    "faqs.md",
    "booking.md",
  ]) {
    if (!names.has(required)) fail(`missing knowledge file ${required}`);
  }

  const chunks = loadChunks();
  if (chunks.length < 9) fail(`expected several chunks, found ${chunks.length}`);
  else pass(`loaded ${docs.length} docs and ${chunks.length} chunks`);

  const cities = listServiceCities();
  if (!cities.includes("Irvine") || cities.length < 20) {
    fail("service city list did not parse");
  } else {
    pass(`parsed ${cities.length} service cities`);
  }

  for (const test of cases) {
    const ranked = rankByKeywords(test.question, chunks, 4);
    const found = ranked.some((chunk) => test.sources.includes(chunk.source));
    if (!found) {
      fail(
        `${test.id} retrieval missed ${test.sources.join(", ")} (got ${ranked
          .map((chunk) => chunk.source)
          .join(", ")})`,
      );
    } else {
      pass(`${test.id} retrieves ${test.sources.join(", ")}`);
    }
  }

  const instructions = buildInstructions({
    mode: "keyword",
    weakMatch: false,
    chunks: chunks.filter((chunk) => chunk.source === "pricing.md").slice(0, 1).map((chunk) => ({
      ...chunk,
      score: 1,
    })),
  });
  if (!instructions.includes("pricing.md") || !instructions.includes("Sources:")) {
    fail("instructions did not require a source citation");
  } else {
    pass("instructions require citations and include the passage file");
  }

  clearAppointments();
  const booked = bookAppointment(
    {
      name: "Priya Shah",
      city: "Irvine",
      issue: "Upstairs system is blowing warm air",
      preferredTime: "Thursday morning",
      urgency: "routine",
    },
    { persist: false },
  );
  if (booked.status !== "confirmed" || !booked.ok || !/^OC-\d{8}-[A-F0-9]{4}$/.test(booked.id)) {
    fail(`routine booking did not confirm (${booked.status})`);
  } else {
    pass(`routine booking confirmed ${booked.id}`);
  }

  const outside = bookAppointment(
    {
      name: "Priya Shah",
      city: "Riverside",
      issue: "The air conditioner is loud",
      preferredTime: "Friday afternoon",
      urgency: "soon",
    },
    { persist: false },
  );
  if (outside.status !== "needs-info") fail("Riverside was accepted");
  else pass("Riverside is rejected");

  const gas = bookAppointment(
    {
      name: "Sam Lee",
      city: "Santa Ana",
      issue: "I smell gas near the furnace",
      preferredTime: "now",
      urgency: "emergency",
    },
    { persist: false },
  );
  if (gas.status !== "emergency-redirect" || (gas.ok && gas.dispatch)) {
    fail("gas smell was treated as a normal dispatch");
  } else if (!gas.ok || !gas.message.includes("911")) {
    fail("gas response did not mention 911");
  } else {
    pass("gas smell redirects to 911 and does not dispatch");
  }

  const extreme = bookAppointment(
    {
      name: "Sam Lee",
      city: "HB",
      issue: "No cooling during a heat wave and we have an infant at home",
      preferredTime: "today",
      urgency: "emergency",
    },
    { persist: false },
  );
  if (
    extreme.status !== "confirmed" ||
    !extreme.ok ||
    !extreme.emergency ||
    extreme.appointment.cityMatched !== "Huntington Beach"
  ) {
    fail("extreme no-cooling call was not flagged for Huntington Beach");
  } else {
    pass("extreme no-cooling call flagged and HB alias matched");
  }
}

async function runOnline() {
  const config = getAiConfig();
  if (!config.ok) {
    console.log("\nSkipped live model checks. Add AI_GATEWAY_API_KEY or OPENAI_API_KEY to run them.");
    return;
  }

  console.log(`\nLive checks with ${config.mode} model ${config.chatModel}`);
  for (const test of cases) {
    const retrieval = await retrieve(test.question, 4);
    const cited = retrieval.chunks.some((chunk) => test.sources.includes(chunk.source));
    if (!cited) {
      fail(`${test.id} live retrieval missed ${test.sources.join(", ")}`);
      continue;
    }
    const result = await generateText({
      model: resolveLanguageModel(config),
      instructions: buildInstructions(retrieval),
      prompt: test.question,
    });
    const text = result.text;
    const hasSource = test.sources.some((source) => text.includes(source));
    const hasExpect = includesAny(text, test.expect);
    const hasForbid = (test.forbid ?? []).some((phrase) =>
      text.toLowerCase().includes(phrase.toLowerCase()),
    );
    if (!hasSource || !hasExpect || hasForbid) {
      fail(
        `${test.id} answer missed a citation or expected phrase.\n${text.slice(0, 500)}`,
      );
    } else {
      pass(`${test.id} answer cites ${test.sources.join(", ")}`);
    }
  }
}

runOffline();
runOnline()
  .then(() => {
    if (failures.length > 0) {
      console.error(`\n${failures.length} check(s) failed.`);
      process.exit(1);
    }
    console.log("\nAll checks passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
