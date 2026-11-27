import { LogoMark } from "@/components/logo-mark";
import { company } from "@/lib/company";

export function SiteHeader() {
  return (
    <header className="border-b border-line/80 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#top" className="flex items-center gap-3">
          <LogoMark />
          <span>
            <span className="block text-sm font-semibold tracking-tight">
              {company.name}
            </span>
            <span className="block text-xs text-ink/70">
              Fictional shop · Santa Ana
            </span>
          </span>
        </a>
        <a
          href={company.phoneTel}
          className="rounded-full bg-teal px-3 py-2 text-sm font-semibold text-cream"
        >
          {company.phoneDisplay}
        </a>
      </div>
    </header>
  );
}
