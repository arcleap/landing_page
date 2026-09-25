import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Explorations } from "@/components/Explorations";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <Explorations />
      </main>
      <Footer />
    </>
  );
}
