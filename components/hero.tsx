import { company } from "@/lib/company";

export function Hero() {
  return (
    <div className="max-w-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-deep">
        Residential heating and cooling
      </p>
      <h1 className="display mt-3 text-4xl leading-tight text-ink sm:text-5xl">
        Straight answers for a hot afternoon or a cold morning.
      </h1>
      <p className="mt-4 text-lg leading-7 text-ink/80">
        {company.name} is a fictional Orange County shop. Ask about repairs,
        maintenance, price ranges, or a visit. The assistant uses the shop&apos;s
        written notes and shows which note it used.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="#assistant"
          className="rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white"
        >
          Ask the assistant
        </a>
        <a
          href={company.phoneTel}
          className="rounded-full border border-line bg-cream px-5 py-3 text-sm font-semibold"
        >
          Call {company.phoneDisplay}
        </a>
      </div>
      <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Fact title="Diagnostic" value="From $89" detail="Weekday visit" />
        <Fact title="Comfort Club" value="$189/yr" detail="One system" />
        <Fact title="Hours" value="7a–6p" detail="Mon–Fri" />
      </dl>
    </div>
  );
}

function Fact({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-cream px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-teal">
        {title}
      </dt>
      <dd className="display mt-1 text-2xl">{value}</dd>
      <dd className="text-xs text-ink/65">{detail}</dd>
    </div>
  );
}
