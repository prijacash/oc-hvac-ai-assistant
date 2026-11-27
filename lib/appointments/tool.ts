import { tool } from "ai";
import { z } from "zod";
import { bookAppointment } from "@/lib/appointments/book";
import type { Urgency } from "@/lib/appointments/types";

export const requestServiceAppointment = tool({
  description:
    "Log a service appointment request for Orange County HVAC Techs. Call this only after the customer has given a name, city, issue, preferred time, and urgency. The tool validates the city, flags gas emergencies, and stores the request. Never tell the customer a visit is booked unless the result status is confirmed.",
  inputSchema: z.object({
    name: z.string().describe("Customer full name"),
    city: z.string().describe("Orange County city where the system is located"),
    issue: z.string().describe("What is wrong, in the customer's words"),
    preferredTime: z
      .string()
      .describe('Preferred day and window, for example "Thursday morning"'),
    urgency: z
      .enum(["routine", "soon", "emergency"])
      .describe(
        "routine can wait several days, soon means this week, emergency means unsafe temperatures or the customer says it cannot wait",
      ),
  }),
  execute: async ({ name, city, issue, preferredTime, urgency }) =>
    bookAppointment({
      name,
      city,
      issue,
      preferredTime,
      urgency: urgency as Urgency,
    }),
});
