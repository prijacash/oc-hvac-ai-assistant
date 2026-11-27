import type { AppointmentResult } from "@/lib/appointments/types";

export function AppointmentCard({ result }: { result: AppointmentResult }) {
  if (result.status === "emergency-redirect") {
    return (
      <article className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-950">
        <p className="font-semibold">Gas or carbon monoxide — do not wait</p>
        <p className="mt-1 leading-6">{result.message}</p>
        <p className="mt-2 text-xs font-medium">Log id {result.id} · not a dispatch</p>
      </article>
    );
  }

  if (result.status === "needs-info") {
    return (
      <article className="rounded-2xl border border-amber bg-amber/30 p-3 text-sm">
        <p className="font-semibold">Need a few details before logging a visit</p>
        <p className="mt-1 leading-6">{result.message}</p>
        <ul className="mt-2 list-disc pl-4">
          {Object.entries(result.fieldErrors).map(([field, error]) => (
            <li key={field}>{error}</li>
          ))}
        </ul>
      </article>
    );
  }

  return (
    <article
      className={
        result.emergency
          ? "rounded-2xl border border-orange/40 bg-orange/10 p-3 text-sm"
          : "rounded-2xl border border-teal/30 bg-teal/10 p-3 text-sm"
      }
    >
      <p className="font-semibold">
        {result.emergency ? "Emergency visit logged" : "Visit request logged"}
      </p>
      <p className="mt-1 leading-6">{result.message}</p>
      <p className="mt-2 font-mono text-xs">Confirmation {result.id}</p>
    </article>
  );
}
