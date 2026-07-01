import { Link } from "@tanstack/react-router";
import { SiDiscord } from "react-icons/si";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import RoleHierarchySection from "../components/layout/RoleHierarchySection";
import StaffListSection from "../components/layout/StaffListSection";
import { useFadeIn } from "../hooks/useFadeIn";

function FadeSection({
  children,
  delay = 0,
}: { children: React.ReactNode; delay?: number }) {
  const ref = useFadeIn<HTMLDivElement>(delay);
  return <div ref={ref}>{children}</div>;
}

export default function Team() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.10 0.04 295)" }}
    >
      <Navbar />
      <main className="pt-16">
        <div
          className="relative overflow-hidden"
          style={{
            background: "oklch(0.13 0.08 270)",
            borderBottom: "2px solid oklch(0.32 0.18 270)",
          }}
        >
          <div className="absolute inset-0 block-texture opacity-10" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
              <SiDiscord
                size={22}
                style={{ color: "oklch(0.72 0.18 270)", flexShrink: 0 }}
              />
              <p
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.25rem",
                  color: "oklch(0.88 0.08 270)",
                  lineHeight: 1.4,
                }}
              >
                ★ Interested in joining the team?{" "}
                <Link
                  to="/apply"
                  style={{
                    color: "oklch(0.72 0.22 295)",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "oklch(0.88 0.22 295)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "oklch(0.72 0.22 295)";
                  }}
                >
                  Apply for Staff!
                </Link>
              </p>
            </div>
          </div>
        </div>

        <FadeSection delay={0}>
          <RoleHierarchySection />
        </FadeSection>

        <FadeSection delay={100}>
          <StaffListSection />
        </FadeSection>
      </main>
      <Footer />
    </div>
  );
}
