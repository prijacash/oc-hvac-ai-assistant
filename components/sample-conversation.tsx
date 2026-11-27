import type { ReactNode } from "react";
import { AppointmentCard } from "@/components/appointment-card";
import type { AppointmentResult } from "@/lib/appointments/types";

const confirmed: AppointmentResult = {
  ok: true,
  status: "confirmed",
  emergency: false,
  emergencyKind: "none",
  dispatch: true,
  id: "OC-SAMPLE-1042",
  message:
    "Request OC-SAMPLE-1042 is logged for Priya Shah in Irvine. Preferred time: Thursday morning. The office would confirm a two-hour window. This is a fictional demo log, not a real appointment.",
  appointment: {
    id: "OC-SAMPLE-1042",
    name: "Priya Shah",
    city: "Irvine",
    cityMatched: "Irvine",
    issue: "Upstairs system is blowing warm air.",
    preferredTime: "Thursday morning",
    urgency: "routine",
    emergencyKind: "none",
    dispatch: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
};

export function SampleConversation() {
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-amber/40 px-3 py-2 text-xs leading-5 text-ink">
        Sample, written by hand — not a live model response.
      </p>
      <Bubble role="user">How much is a weekday diagnostic visit?</Bubble>
      <Bubble role="assistant">
        A weekday diagnostic visit during posted hours is $89. It is waived when
        a repair is approved on that same visit. Comfort Club members do not pay
        a diagnostic fee.
        <Sources files={["pricing.md · Diagnostic visit"]} />
      </Bubble>
      <Bubble role="user">
        I smell gas in the kitchen. Can you send someone?
      </Bubble>
      <Bubble role="assistant">
        Leave the building now and call 911 from outside, then the gas utility.
        This shop will not send a technician as the first response.
        <div className="mt-2">
          <AppointmentCard
            result={{
              ok: true,
              status: "emergency-redirect",
              emergency: true,
              emergencyKind: "gas",
              dispatch: false,
              id: "OC-SAMPLE-9110",
              message:
                "Leave the building now. Do not wait for a technician. From outside, call 911, then call Southern California Gas Company at 1-800-427-2200. Reference OC-SAMPLE-9110 is only a log. It is not a dispatch.",
              appointment: {
                id: "OC-SAMPLE-9110",
                name: "Sample",
                city: "Santa Ana",
                cityMatched: "Santa Ana",
                issue: "Gas smell in the kitchen",
                preferredTime: "Now",
                urgency: "emergency",
                emergencyKind: "gas",
                dispatch: false,
                createdAt: "2026-01-01T00:00:00.000Z",
              },
            }}
          />
        </div>
        <Sources files={["emergency.md · Gas smell or carbon monoxide"]} />
      </Bubble>
      <Bubble role="user">
        Book a routine visit for Priya Shah in Irvine. The upstairs system blows
        warm air. Thursday morning is fine.
      </Bubble>
      <Bubble role="assistant">
        <AppointmentCard result={confirmed} />
        <p className="mt-2">
          I logged that as a routine request. A real shop would still confirm the
          two-hour window by phone. This id is only a demo log.
        </p>
        <Sources files={["booking.md · What we collect"]} />
      </Bubble>
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: ReactNode;
}) {
  const user = role === "user";
  return (
    <div className={user ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          user
            ? "max-w-[90%] rounded-2xl rounded-br-md bg-ink px-3 py-2 text-sm leading-6 text-cream"
            : "max-w-[95%] rounded-2xl rounded-bl-md border border-line bg-paper px-3 py-2 text-sm leading-6"
        }
      >
        {children}
      </div>
    </div>
  );
}

function Sources({ files }: { files: string[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-1">
      {files.map((file) => (
        <li
          key={file}
          className="rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-medium text-teal-deep"
        >
          {file}
        </li>
      ))}
    </ul>
  );
}
