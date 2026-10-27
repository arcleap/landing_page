import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Approach } from "@/components/Approach";
import { AnyWorld } from "@/components/AnyWorld";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <Approach />
        <AnyWorld />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
