import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Services from "@/components/Services";
import About from "@/components/About";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AiShowcase from "@/components/AiShowcase";
import Faq from "@/components/Faq";
import Assistant from "@/components/assistant/Assistant";

// Proof comes straight after the hero: visitors see real work before anything else.
export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-[5px] focus:bg-signal focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Work />
        <AiShowcase />
        <Services />
        <About />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <Assistant />
    </>
  );
}
