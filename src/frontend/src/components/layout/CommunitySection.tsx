import { Heart, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import JoinServerModal from "../JoinServerModal";

const stats = [
  { value: "3K", label: "Players Joined", icon: Heart },
  { value: "50", label: "Daily Active", icon: Star },
  { value: "10", label: "Staff Members", icon: MessageSquare },
];

const testimonials = [
  {
    name: "Steve_Builder",
    text: "Best Minecraft server I've ever played on. The community is amazing!",
    stars: 5,
  },
  {
    name: "DiamondMiner99",
    text: "ZoritLegends has the most fun PvP I've experienced. Highly recommend!",
    stars: 5,
  },
  {
    name: "CreeperSlayer",
    text: "The events are incredible. Won my first tournament last week!",
    stars: 5,
  },
];

export default function CommunitySection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        id="community"
        className="py-24 relative overflow-hidden"
        style={{ background: "oklch(0.09 0.04 295)" }}
      >
        <div className="pixel-divider absolute top-0 left-0 right-0" />

        <div className="absolute inset-0 block-texture opacity-15" />

        <div
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 opacity-5 rotate-12"
          style={{ background: "oklch(0.62 0.22 295)" }}
        />
        <div
          className="absolute -left-20 top-1/4 w-48 h-48 opacity-5 -rotate-6"
          style={{ background: "oklch(0.55 0.25 295)" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-1 mb-4 font-pixel"
              style={{
                background: "oklch(0.20 0.10 295)",
                border: "2px solid oklch(0.40 0.18 295)",
                color: "oklch(0.70 0.20 295)",
                fontSize: "0.5rem",
                letterSpacing: "0.15em",
              }}
            >
              OUR COMMUNITY
            </div>
            <h2
              className="font-pixel mb-4"
              style={{
                fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)",
                color: "oklch(0.97 0.01 295)",
                lineHeight: "1.8",
                textShadow: "3px 3px 0 oklch(0.10 0.04 295)",
              }}
            >
              Join Thousands of Legends
            </h2>
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.2rem",
                color: "oklch(0.60 0.10 295)",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Be part of a thriving community of players who share your passion
              for adventure
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center p-8 relative"
                  style={{
                    background: "oklch(0.14 0.07 295)",
                    border: "2px solid oklch(0.28 0.12 295)",
                    boxShadow: "4px 4px 0 oklch(0.07 0.03 295)",
                  }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: "oklch(0.20 0.10 295)",
                      border: "2px solid oklch(0.45 0.20 295)",
                    }}
                  >
                    <Icon size={22} style={{ color: "oklch(0.70 0.20 295)" }} />
                  </div>
                  <div
                    className="font-pixel mb-2"
                    style={{
                      fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                      color: "oklch(0.85 0.18 295)",
                      textShadow: "2px 2px 0 oklch(0.10 0.04 295)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1.1rem",
                      color: "oklch(0.55 0.10 295)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6"
                style={{
                  background: "oklch(0.15 0.07 295)",
                  border: "2px solid oklch(0.25 0.10 295)",
                }}
              >
                <div className="flex gap-1 mb-3">
                  {Array.from(
                    { length: t.stars },
                    (_, i) => `star-${i + 1}`,
                  ).map((starKey) => (
                    <span
                      key={starKey}
                      style={{
                        color: "oklch(0.75 0.20 80)",
                        fontSize: "0.9rem",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p
                  className="mb-4"
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1.1rem",
                    color: "oklch(0.72 0.08 295)",
                    lineHeight: "1.5",
                  }}
                >
                  "{t.text}"
                </p>
                <div
                  className="font-pixel"
                  style={{
                    fontSize: "0.5rem",
                    color: "oklch(0.55 0.15 295)",
                  }}
                >
                  — {t.name}
                </div>
              </div>
            ))}
          </div>

          <div
            className="text-center p-10 relative overflow-hidden"
            style={{
              background: "oklch(0.18 0.10 295)",
              border: "2px solid oklch(0.40 0.18 295)",
              boxShadow: "0 0 40px oklch(0.62 0.22 295 / 0.15)",
            }}
          >
            <div
              className="absolute top-0 left-0 w-4 h-4"
              style={{ background: "oklch(0.55 0.22 295)" }}
            />
            <div
              className="absolute top-0 right-0 w-4 h-4"
              style={{ background: "oklch(0.55 0.22 295)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-4 h-4"
              style={{ background: "oklch(0.55 0.22 295)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4"
              style={{ background: "oklch(0.55 0.22 295)" }}
            />

            <h3
              className="font-pixel mb-4"
              style={{
                fontSize: "clamp(0.7rem, 2vw, 1rem)",
                color: "oklch(0.97 0.01 295)",
                lineHeight: "1.8",
              }}
            >
              Ready to Become a Legend?
            </h3>
            <p
              className="mb-6"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.2rem",
                color: "oklch(0.65 0.10 295)",
              }}
            >
              Join ZoritLegends today and start your adventure!
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="minecraft-btn px-10 py-4"
              style={{
                background: "oklch(0.55 0.25 295)",
                color: "oklch(0.99 0 0)",
                boxShadow:
                  "0 5px 0 oklch(0.28 0.14 295), inset 0 2px 0 oklch(0.72 0.22 295)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
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
              ▶ JOIN THE ADVENTURE
            </button>
          </div>
        </div>

        <div className="pixel-divider absolute bottom-0 left-0 right-0" />
      </section>

      <JoinServerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
