import { company } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm leading-6 sm:flex-row sm:items-end sm:justify-between">
        <p>
          <span className="font-semibold text-amber">Fictional demo.</span>{" "}
          {company.name}, {company.license}, {company.address}, and{" "}
          {company.phoneDisplay} are not real. Built by Prija Cash to show an AI
          assistant with retrieval, citations, and one booking tool.
        </p>
        <p className="text-cream/70">
          Gas emergency in real life: leave, call 911, then {company.gasUtility}{" "}
          at {company.gasPhone}.
        </p>
      </div>
    </footer>
  );
}
