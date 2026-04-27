import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Positioning } from "@/components/Positioning";
import { PillarGrid } from "@/components/PillarGrid";
import { ProductCard } from "@/components/ProductCard";
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
        <ProductCard />
        <Company />
      </main>
      <Footer />
    </>
  );
}
