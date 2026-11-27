export const company = {
  name: "Orange County HVAC Techs",
  phoneDisplay: "(714) 555-0198",
  phoneTel: "tel:+17145550198",
  email: "hello@ochvac.example",
  address: "1200 N Harbor Blvd, Suite 210, Santa Ana, CA 92703",
  license: "CSLB #999999",
  gasUtility: "Southern California Gas Company",
  gasPhone: "1-800-427-2200",
  weekdayHours: "Monday–Friday 7:00 a.m.–6:00 p.m.",
  saturdayHours: "Saturday 8:00 a.m.–2:00 p.m.",
  sundayHours: "Sunday closed, except emergency calls",
} as const;

export const setupMessage =
  "Add AI_GATEWAY_API_KEY or OPENAI_API_KEY to .env.local, then restart. On Vercel, an OIDC token can stand in for the gateway key. See the README.";
