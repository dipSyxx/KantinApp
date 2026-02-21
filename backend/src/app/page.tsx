import { Navbar } from "./components/landing/Navbar";
import { Hero } from "./components/landing/Hero";
import { Features } from "./components/landing/Features";
import { HowItWorks } from "./components/landing/HowItWorks";
import { ForWhom } from "./components/landing/ForWhom";
import { WhySection } from "./components/landing/WhySection";
import { Footer } from "./components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ForWhom />
      <WhySection />
      <Footer />
    </>
  );
}
