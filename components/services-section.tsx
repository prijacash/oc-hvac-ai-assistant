const services = [
  {
    title: "AC repair",
    text: "Warm air, short cycling, failed capacitors, and condensate leaks. Diagnosis comes before a repair price.",
  },
  {
    title: "Furnace repair",
    text: "No heat, igniters, flame sensors, and inducers. A cracked heat exchanger means the furnace is shut down.",
  },
  {
    title: "Heat pumps",
    text: "Repair and changeout for Orange County's mild climate. Rebates are checked at the visit, not quoted here.",
  },
  {
    title: "Comfort Club",
    text: "Two tune-ups a year, a waived diagnostic fee, 15% off repairs, and priority scheduling.",
  },
  {
    title: "Duct cleaning",
    text: "Supply and return cleaning for a typical home. It is not mold remediation.",
  },
];

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="services-heading">
      <div className="max-w-2xl">
        <h2 id="services-heading" className="display text-3xl">
          What the shop says it does
        </h2>
        <p className="mt-3 text-ink/75">
          These cards match the fictional knowledge base. The assistant is not
          allowed to add services or prices that those notes do not contain.
        </p>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li
            key={service.title}
            className="rounded-3xl border border-line bg-cream p-5 shadow-[0_1px_0_rgba(28,25,21,0.04)]"
          >
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/75">{service.text}</p>
          </li>
        ))}
        <li className="rounded-3xl bg-teal p-5 text-cream">
          <h3 className="text-lg font-semibold">Outside the shop</h3>
          <p className="mt-2 text-sm leading-6 text-cream/85">
            No solar, pools, water heaters, or commercial rooftops over 10 tons.
            Los Angeles, Riverside, San Bernardino, and San Diego counties are
            outside the map.
          </p>
        </li>
      </ul>
      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        <Step
          n="1"
          title="Retrieve"
          text="The question is matched to short passages from the markdown knowledge base."
        />
        <Step
          n="2"
          title="Answer from those notes"
          text="The model is told to use the passages, cite the file, or say it does not know."
        />
        <Step
          n="3"
          title="Book only through a tool"
          text="A visit is logged only after the appointment tool validates the city and the safety rules."
        />
      </ol>
    </section>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <li className="rounded-3xl border border-dashed border-orange/40 bg-cream/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-orange-deep">
        Step {n}
      </p>
      <h3 className="mt-1 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/75">{text}</p>
    </li>
  );
}
