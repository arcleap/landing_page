import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Direction } from "@/components/Direction";
import { Explorations } from "@/components/Explorations";
import { Company } from "@/components/Company";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <Direction />
        <Explorations />
        <Company />
      </main>
      <Footer />
    </>
  );
}
