import { company } from "@/lib/company";

export function AreaSection({ cities }: { cities: string[] }) {
  return (
    <section className="border-t border-line bg-cream/70" aria-labelledby="area-heading">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 id="area-heading" className="display text-3xl">
            Orange County, on purpose.
          </h2>
          <p className="mt-3 text-ink/75">
            The assistant books only the cities in the service-area note. Anywhere
            else, it should refuse and point you to a local company.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Weekdays</dt>
              <dd>{company.weekdayHours.replace("Monday–Friday ", "")}</dd>
            </div>
            <div>
              <dt className="font-semibold">Saturday</dt>
              <dd>8:00 a.m.–2:00 p.m.</dd>
            </div>
            <div>
              <dt className="font-semibold">Sunday</dt>
              <dd>Emergency calls only</dd>
            </div>
            <div>
              <dt className="font-semibold">Office</dt>
              <dd>{company.address}</dd>
            </div>
          </dl>
        </div>
        <ul className="flex flex-wrap content-start gap-2">
          {cities.map((city) => (
            <li
              key={city}
              className="rounded-full border border-line bg-paper px-3 py-1 text-sm"
            >
              {city}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
