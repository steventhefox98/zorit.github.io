import { Shield, Sword, Trophy, Users, Zap } from "lucide-react";

const features = [
  {
    icon: "/assets/generated/feature-survival.dim_256x256.png",
    fallbackIcon: Shield,
    title: "Survival",
    description:
      "Explore vast biomes, gather resources, and build your empire from scratch. The world is yours to conquer.",
    color: "oklch(0.55 0.18 145)",
    borderColor: "oklch(0.40 0.15 145)",
    tag: "CLASSIC MODE",
  },
  {
    icon: "/assets/generated/feature-pvp.dim_256x256.png",
    fallbackIcon: Sword,
    title: "PvP Arena",
    description:
      "Test your skills against the best players. Ranked matches, tournaments, and epic battles await.",
    color: "oklch(0.60 0.22 25)",
    borderColor: "oklch(0.45 0.18 25)",
    tag: "COMPETITIVE",
  },
  {
    icon: "/assets/generated/feature-events.dim_256x256.png",
    fallbackIcon: Trophy,
    title: "Events",
    description:
      "Join weekly events, seasonal challenges, and special tournaments with exclusive rewards and prizes.",
    color: "oklch(0.70 0.20 80)",
    borderColor: "oklch(0.55 0.18 80)",
    tag: "WEEKLY",
  },
];

const extraFeatures = [
  {
    icon: Zap,
    title: "Low Latency",
    desc: "Optimized servers for the best performance",
  },
  { icon: Users, title: "24/7 Active", desc: "running non-stop!" },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 relative overflow-hidden"
      style={{ background: "oklch(0.11 0.05 295)" }}
    >
      <div className="absolute inset-0 block-texture opacity-20" />

      <div
        className="absolute top-0 left-0 w-16 h-16 opacity-20"
        style={{
          background: "oklch(0.45 0.20 295)",
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-20"
        style={{
          background: "oklch(0.45 0.20 295)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        }}
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
            GAME MODES
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
            What Awaits You
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
            Choose your path and forge your legend in ZoritLegends
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => {
            const FallbackIcon = feature.fallbackIcon;
            return (
              <div
                key={feature.title}
                className="relative group card-glow transition-all duration-300 cursor-default"
                style={{
                  background: "oklch(0.15 0.07 295)",
                  border: "2px solid oklch(0.28 0.12 295)",
                  boxShadow: "4px 4px 0 oklch(0.08 0.03 295)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "oklch(0.45 0.20 295)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "oklch(0.28 0.12 295)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                }}
              >
                <div
                  className="absolute top-3 right-3 px-2 py-0.5 font-pixel"
                  style={{
                    background: feature.color,
                    color: "oklch(0.99 0 0)",
                    fontSize: "0.4rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  {feature.tag}
                </div>

                <div
                  className="w-full h-40 flex items-center justify-center overflow-hidden"
                  style={{
                    background: "oklch(0.10 0.04 295)",
                    borderBottom: "2px solid oklch(0.28 0.12 295)",
                  }}
                >
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-24 h-24 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-24 h-24 items-center justify-center rounded-none"
                    style={{
                      display: "none",
                      background: "oklch(0.20 0.10 295)",
                      border: `2px solid ${feature.borderColor}`,
                    }}
                  >
                    <FallbackIcon size={40} style={{ color: feature.color }} />
                  </div>
                </div>

                <div className="p-6">
                  <h3
                    className="font-pixel mb-3"
                    style={{
                      fontSize: "0.75rem",
                      color: "oklch(0.97 0.01 295)",
                      textShadow: "2px 2px 0 oklch(0.10 0.04 295)",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1.05rem",
                      color: "oklch(0.65 0.08 295)",
                      lineHeight: "1.5",
                    }}
                  >
                    {feature.description}
                  </p>
                </div>

                <div
                  className="h-1 w-full"
                  style={{ background: feature.color }}
                />
              </div>
            );
          })}
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6"
          style={{
            background: "oklch(0.13 0.06 295)",
            border: "2px solid oklch(0.25 0.10 295)",
          }}
        >
          {extraFeatures.map((ef) => {
            const Icon = ef.icon;
            return (
              <div key={ef.title} className="flex items-center gap-4 p-3">
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.20 0.10 295)",
                    border: "2px solid oklch(0.40 0.18 295)",
                  }}
                >
                  <Icon size={18} style={{ color: "oklch(0.70 0.20 295)" }} />
                </div>
                <div>
                  <p
                    className="font-pixel"
                    style={{
                      fontSize: "0.55rem",
                      color: "oklch(0.90 0.08 295)",
                      marginBottom: "2px",
                    }}
                  >
                    {ef.title}
                  </p>
                  <p
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "0.95rem",
                      color: "oklch(0.55 0.08 295)",
                    }}
                  >
                    {ef.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
