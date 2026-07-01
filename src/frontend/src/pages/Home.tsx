import FeaturesSection from "../components/layout/FeaturesSection";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/layout/HeroSection";
import Navbar from "../components/layout/Navbar";
import RanksSection from "../components/layout/RanksSection";
import WebsiteUpdateSection from "../components/layout/WebsiteUpdateSection";
import { useFadeIn } from "../hooks/useFadeIn";

function FadeSection({
  children,
  delay = 0,
}: { children: React.ReactNode; delay?: number }) {
  const ref = useFadeIn<HTMLDivElement>(delay);
  return <div ref={ref}>{children}</div>;
}

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.10 0.04 295)" }}
    >
      <Navbar />
      <main>
        <HeroSection />
        <FadeSection delay={0}>
          <FeaturesSection />
        </FadeSection>
        <FadeSection delay={100}>
          <RanksSection />
        </FadeSection>
        <FadeSection delay={200}>
          <WebsiteUpdateSection />
        </FadeSection>
      </main>
      <Footer />
    </div>
  );
}
