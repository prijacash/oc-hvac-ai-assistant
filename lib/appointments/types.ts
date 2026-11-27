export type Urgency = "routine" | "soon" | "emergency";

export type AppointmentInput = {
  name: string;
  city: string;
  issue: string;
  preferredTime: string;
  urgency: Urgency;
};

export type StoredAppointment = AppointmentInput & {
  id: string;
  cityMatched: string | null;
  emergencyKind: "gas" | "extreme-comfort" | "none";
  dispatch: boolean;
  createdAt: string;
};

export type AppointmentResult =
  | {
      ok: true;
      status: "confirmed" | "emergency-redirect";
      emergency: boolean;
      emergencyKind: StoredAppointment["emergencyKind"];
      dispatch: boolean;
      id: string;
      message: string;
      appointment: StoredAppointment;
    }
  | {
      ok: false;
      status: "needs-info";
      emergency: boolean;
      message: string;
      fieldErrors: Record<string, string>;
    };

export function isAppointmentResult(value: unknown): value is AppointmentResult {
  if (typeof value !== "object" || value === null || !("status" in value)) return false;
  const status = (value as { status?: unknown }).status;
  return status === "confirmed" || status === "emergency-redirect" || status === "needs-info";
}
