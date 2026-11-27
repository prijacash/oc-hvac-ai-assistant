import { AreaSection } from "@/components/area-section";
import { ChatPanel } from "@/components/chat-panel";
import { DemoBanner } from "@/components/demo-banner";
import { Hero } from "@/components/hero";
import { ServicesSection } from "@/components/services-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listServiceCities } from "@/lib/knowledge/cities";

export default function Home() {
  const cities = listServiceCities();

  return (
    <div id="top">
      <DemoBanner />
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:py-12">
          <Hero />
          <ChatPanel />
        </section>
        <ServicesSection />
        <AreaSection cities={cities} />
      </main>
      <SiteFooter />
    </div>
  );
}
