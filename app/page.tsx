import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Approach } from "@/components/Approach";
import { Applications } from "@/components/Applications";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <Approach />
        <Applications />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
