import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import JoinServerModal from "../JoinServerModal";
import LearnMoreModal from "../LearnMoreModal";

export default function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  return (
    <>
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "oklch(0.08 0.04 295)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(/assets/generated/hero-banner.dim_1440x600.png)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />

        <div className="absolute inset-0 star-bg" />

        <div className="absolute inset-0 hero-overlay" />

        <div className="absolute inset-0 block-texture opacity-30" />

        {/* Dramatic glow burst behind content */}
        <div
          className="hero-reveal absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, oklch(0.55 0.25 295 / 0.18) 0%, transparent 70%)",
            animationDelay: "0.2s",
          }}
        />

        <div
          className="absolute inset-0 overflow-hidden pointer-events-none hero-reveal"
          style={{ animationDelay: "1.5s" }}
        >
          {[
            { id: "p1", left: "10%", top: "20%", dur: 2.5, delay: 0 },
            { id: "p2", left: "22%", top: "40%", dur: 2.9, delay: 0.3 },
            { id: "p3", left: "34%", top: "60%", dur: 3.3, delay: 0.6 },
            { id: "p4", left: "46%", top: "20%", dur: 3.7, delay: 0.9 },
            { id: "p5", left: "58%", top: "40%", dur: 4.1, delay: 1.2 },
            { id: "p6", left: "70%", top: "60%", dur: 4.5, delay: 1.5 },
            { id: "p7", left: "82%", top: "20%", dur: 4.9, delay: 1.8 },
            { id: "p8", left: "94%", top: "40%", dur: 5.3, delay: 2.1 },
          ].map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 opacity-40"
              style={{
                background: "oklch(0.62 0.22 295)",
                left: p.left,
                top: p.top,
                animation: `float ${p.dur}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                imageRendering: "pixelated",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div
            className="hero-reveal inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-none border"
            style={{
              background: "oklch(0.20 0.10 295 / 0.8)",
              borderColor: "oklch(0.45 0.20 295)",
              color: "oklch(0.80 0.18 295)",
              fontFamily: '"VT323", monospace',
              fontSize: "1.1rem",
              letterSpacing: "0.1em",
              animationDelay: "0.1s",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "oklch(0.65 0.22 145)" }}
            />
            SERVER ONLINE • JOIN NOW
          </div>

          {/* Title */}
          <h1
            className="hero-reveal font-pixel mb-6 leading-tight glow-purple"
            style={{
              fontSize: "clamp(1.2rem, 4vw, 2.5rem)",
              color: "oklch(0.97 0.01 295)",
              lineHeight: "1.6",
              textShadow:
                "0 0 30px oklch(0.62 0.22 295 / 0.6), 4px 4px 0 oklch(0.10 0.04 295)",
              animationDelay: "0.4s",
            }}
          >
            Welcome to
            <br />
            <span
              className="shimmer-text"
              style={{ fontSize: "clamp(1.5rem, 5vw, 3.2rem)" }}
            >
              ZoritLegends
            </span>
          </h1>

          {/* Description */}
          <p
            className="hero-reveal mb-10 max-w-2xl mx-auto"
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
              color: "oklch(0.75 0.12 295)",
              letterSpacing: "0.05em",
              lineHeight: "1.5",
              animationDelay: "0.7s",
            }}
          >
            The ultimate Minecraft experience awaits. Battle, survive, and
            conquer alongside thousands of players in an epic world of legends.
          </p>

          {/* Buttons */}
          <div
            className="hero-reveal flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animationDelay: "1.0s" }}
          >
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="minecraft-btn px-8 py-4 text-base pulse-glow-anim"
              style={{
                background: "oklch(0.55 0.25 295)",
                color: "oklch(0.99 0 0)",
                boxShadow:
                  "0 5px 0 oklch(0.28 0.14 295), inset 0 2px 0 oklch(0.72 0.22 295)",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                minWidth: "200px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.62 0.25 295)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.55 0.25 295)";
              }}
            >
              ▶ JOIN SERVER
            </button>

            <button
              type="button"
              onClick={() => setLearnMoreOpen(true)}
              className="minecraft-btn px-8 py-4 text-base"
              style={{
                background: "oklch(0.22 0.09 295)",
                color: "oklch(0.85 0.15 295)",
                boxShadow:
                  "0 5px 0 oklch(0.10 0.04 295), inset 0 2px 0 oklch(0.35 0.14 295)",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                minWidth: "200px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.28 0.12 295)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.22 0.09 295)";
              }}
            >
              LEARN MORE
            </button>

            <Link
              to="/apply"
              className="minecraft-btn px-8 py-4 text-base inline-flex items-center justify-center"
              style={{
                background: "oklch(0.45 0.20 295)",
                color: "oklch(0.99 0 0)",
                boxShadow:
                  "0 5px 0 oklch(0.22 0.12 295), inset 0 2px 0 oklch(0.62 0.22 295)",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                minWidth: "200px",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.52 0.22 295)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.45 0.20 295)";
              }}
            >
              ✎ APPLY FOR STAFF
            </Link>
          </div>

          {/* IP Display */}
          <div
            className="hero-reveal mt-8 flex items-center justify-center gap-2"
            style={{ animationDelay: "1.3s" }}
          >
            <span
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1rem",
                color: "oklch(0.50 0.12 295)",
              }}
            >
              IP:
            </span>
            <span
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.1rem",
                color: "oklch(0.65 0.18 295)",
                letterSpacing: "0.05em",
              }}
            >
              mc.zoritlegends.com:60458
            </span>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "0.9rem",
              color: "oklch(0.50 0.12 295)",
            }}
          >
            SCROLL
          </span>
          <ChevronDown size={20} style={{ color: "oklch(0.50 0.12 295)" }} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 pixel-divider" />
      </section>

      <JoinServerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <LearnMoreModal
        open={learnMoreOpen}
        onClose={() => setLearnMoreOpen(false)}
      />
    </>
  );
}
