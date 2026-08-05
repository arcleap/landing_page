import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Positioning } from "@/components/Positioning";
import { Process } from "@/components/Process";
import { Builders } from "@/components/Builders";
import { Company } from "@/components/Company";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <Process />
        <Positioning />
        <Builders />
        <Company />
      </main>
      <Footer />
    </>
  );
}
