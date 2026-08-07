import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { AgentLoop } from "@/components/AgentLoop";
import { Verification } from "@/components/Verification";
import { System } from "@/components/System";
import { Company } from "@/components/Company";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <AgentLoop />
        <Verification />
        <System />
        <Company />
      </main>
      <Footer />
    </>
  );
}
