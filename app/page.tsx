import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Positioning } from "@/components/Positioning";
import { PillarGrid } from "@/components/PillarGrid";
import { Company } from "@/components/Company";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Positioning />
        <PillarGrid />
        <Company />
      </main>
      <Footer />
    </>
  );
}
