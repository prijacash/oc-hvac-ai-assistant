import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { company } from "@/lib/company";
import { listServiceCities, matchCity } from "@/lib/knowledge/cities";
import type {
  AppointmentInput,
  AppointmentResult,
  StoredAppointment,
  Urgency,
} from "@/lib/appointments/types";

export type { AppointmentInput, AppointmentResult, StoredAppointment, Urgency };

const memory = globalThis as { __ochvacAppointments?: StoredAppointment[] };

function store(): StoredAppointment[] {
  if (!memory.__ochvacAppointments) memory.__ochvacAppointments = [];
  return memory.__ochvacAppointments;
}

export function listAppointments(): StoredAppointment[] {
  return [...store()];
}

export function clearAppointments(): void {
  memory.__ochvacAppointments = [];
}

const GAS =
  /gas smell|smell(?:s|ing)?(?: of| like)? gas|rotten egg|carbon monoxide|\bco alarm\b|gas leak|hissing gas/;
const COMFORT =
  /no heat|no heating|not heating|won't heat|wont heat|without heat|no ac\b|no a\/c|no air|not cooling|won't cool|wont cool|no cooling|without cooling|without ac\b/;
const EXTREME =
  /extreme|heat wave|freezing|unsafe|infant|newborn|elderly|heat stroke|medically|95 ?degrees|below 45|under 45/;

export function classifyIssue(
  text: string,
  urgency: Urgency,
): StoredAppointment["emergencyKind"] {
  const haystack = text.toLowerCase();
  if (GAS.test(haystack)) return "gas";
  if (COMFORT.test(haystack) && (EXTREME.test(haystack) || urgency === "emergency")) {
    return "extreme-comfort";
  }
  return "none";
}

function makeId(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `OC-${year}${month}${day}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

function persist(appointment: StoredAppointment) {
  store().push(appointment);
  if (process.env.OCHVAC_SKIP_PERSIST === "1") return;
  const line = `${JSON.stringify(appointment)}\n`;
  const targets = [
    path.join(process.cwd(), "data", "appointments.jsonl"),
    path.join("/tmp", "ochvac-appointments.jsonl"),
  ];
  for (const file of targets) {
    try {
      mkdirSync(path.dirname(file), { recursive: true });
      appendFileSync(file, line);
      return;
    } catch {
      // The next target may be writable. Serverless disks often are not.
    }
  }
}

export function bookAppointment(
  input: AppointmentInput,
  options?: { persist?: boolean },
): AppointmentResult {
  const name = input.name.trim();
  const city = input.city.trim();
  const issue = input.issue.trim();
  const preferredTime = input.preferredTime.trim();
  const blob = `${name}\n${city}\n${issue}\n${preferredTime}`;
  const emergencyKind = classifyIssue(blob, input.urgency);

  if (emergencyKind === "gas") {
    const id = makeId();
    const appointment: StoredAppointment = {
      ...input,
      name: name || "Unknown",
      city,
      issue,
      preferredTime,
      id,
      cityMatched: matchCity(city),
      emergencyKind,
      dispatch: false,
      createdAt: new Date().toISOString(),
    };
    if (options?.persist !== false) persist(appointment);
    return {
      ok: true,
      status: "emergency-redirect",
      emergency: true,
      emergencyKind,
      dispatch: false,
      id,
      appointment,
      message: `Leave the building now. Do not wait for a technician. From outside, call 911, then call ${company.gasUtility} at ${company.gasPhone}. Reference ${id} is only a log for the office. It is not a dispatch and not a confirmed visit.`,
    };
  }

  const fieldErrors: Record<string, string> = {};
  if (!/^[\p{L}][\p{L}\s.'-]{1,79}$/u.test(name)) {
    fieldErrors.name = "Ask for a full name, at least two letters.";
  }
  const matched = matchCity(city, listServiceCities());
  if (!matched) {
    fieldErrors.city = city
      ? `${city} is outside the Orange County service area, or it is not specific enough. Ask for a city on the service-area list.`
      : "Ask which Orange County city the home is in.";
  }
  if (issue.length < 8) {
    fieldErrors.issue = "Ask for a short description of what the system is doing.";
  }
  if (preferredTime.length < 3) {
    fieldErrors.preferredTime =
      "Ask for a preferred day and window, such as Thursday morning.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    const urgent = emergencyKind === "extreme-comfort";
    return {
      ok: false,
      status: "needs-info",
      emergency: urgent,
      fieldErrors,
      message: urgent
        ? `This sounds like an emergency no-heat or no-cooling call. Tell them to phone ${company.phoneDisplay} now. Do not confirm a visit until the missing details are fixed.`
        : "Do not confirm a visit. Ask for the missing details and call the tool again.",
    };
  }

  const id = makeId();
  const appointment: StoredAppointment = {
    name,
    city: matched ?? city,
    issue,
    preferredTime,
    urgency: emergencyKind === "extreme-comfort" ? "emergency" : input.urgency,
    id,
    cityMatched: matched,
    emergencyKind,
    dispatch: true,
    createdAt: new Date().toISOString(),
  };
  if (options?.persist !== false) persist(appointment);

  if (emergencyKind === "extreme-comfort") {
    return {
      ok: true,
      status: "confirmed",
      emergency: true,
      emergencyKind,
      dispatch: true,
      id,
      appointment,
      message: `Emergency visit logged as ${id} for ${matched}. Same-day priority applies. If this is outside posted hours, the after-hours trip charge is $149 and is not waived. If anyone is in medical distress, call 911 first. This id is a demo log, not a real work order.`,
    };
  }

  return {
    ok: true,
    status: "confirmed",
    emergency: false,
    emergencyKind: "none",
    dispatch: true,
    id,
    appointment,
    message: `Request ${id} is logged for ${name} in ${matched}. Preferred time: ${preferredTime}. The office would confirm a two-hour window. This is a fictional demo log, not a real appointment.`,
  };
}
