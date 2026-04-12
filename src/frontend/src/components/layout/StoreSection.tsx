import { Crown, Gem, Package } from "lucide-react";

const packages = [
  {
    icon: Package,
    name: "Starter Pack",
    price: "FREE",
    features: [
      "Basic starter kit",
      "Access to all game modes",
      "Community chat",
      "1 home location",
    ],
    highlight: false,
    color: "oklch(0.55 0.10 295)",
  },
  {
    icon: Gem,
    name: "Legend Rank",
    price: "$9.99",
    features: [
      "Exclusive Legend prefix",
      "Custom particle effects",
      "5 home locations",
      "Priority queue access",
      "Monthly reward crate",
    ],
    highlight: true,
    color: "oklch(0.62 0.22 295)",
  },
  {
    icon: Crown,
    name: "Mythic Rank",
    price: "$19.99",
    features: [
      "Mythic crown prefix",
      "All Legend perks",
      "Unlimited homes",
      "Custom join message",
      "Exclusive Mythic kit",
      "VIP Discord access",
    ],
    highlight: false,
    color: "oklch(0.70 0.20 80)",
  },
];

export default function StoreSection() {
  return (
    <section
      id="store"
      className="py-24 relative overflow-hidden"
      style={{ background: "oklch(0.11 0.05 295)" }}
    >
      <div className="absolute inset-0 block-texture opacity-20" />

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
            SERVER STORE
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
            Upgrade Your Experience
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
            Support the server and unlock exclusive perks and cosmetics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.name}
                className="relative flex flex-col transition-all duration-300"
                style={{
                  background: pkg.highlight
                    ? "oklch(0.18 0.10 295)"
                    : "oklch(0.14 0.06 295)",
                  border: `2px solid ${pkg.highlight ? "oklch(0.50 0.22 295)" : "oklch(0.25 0.10 295)"}`,
                  boxShadow: pkg.highlight
                    ? "4px 4px 0 oklch(0.08 0.03 295), 0 0 30px oklch(0.62 0.22 295 / 0.2)"
                    : "4px 4px 0 oklch(0.08 0.03 295)",
                }}
              >
                {pkg.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 font-pixel whitespace-nowrap"
                    style={{
                      background: "oklch(0.55 0.25 295)",
                      color: "oklch(0.99 0 0)",
                      fontSize: "0.45rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    ★ MOST POPULAR
                  </div>
                )}

                <div
                  className="h-1.5 w-full"
                  style={{ background: pkg.color }}
                />

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{
                        background: "oklch(0.10 0.04 295)",
                        border: `2px solid ${pkg.color}`,
                      }}
                    >
                      <Icon size={18} style={{ color: pkg.color }} />
                    </div>
                    <h3
                      className="font-pixel"
                      style={{
                        fontSize: "0.65rem",
                        color: "oklch(0.97 0.01 295)",
                      }}
                    >
                      {pkg.name}
                    </h3>
                  </div>

                  <div
                    className="font-pixel mb-6"
                    style={{
                      fontSize: "1.2rem",
                      color: pkg.color,
                      textShadow: "2px 2px 0 oklch(0.08 0.03 295)",
                    }}
                  >
                    {pkg.price}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2"
                        style={{
                          fontFamily: '"VT323", monospace',
                          fontSize: "1rem",
                          color: "oklch(0.70 0.08 295)",
                        }}
                      >
                        <span style={{ color: pkg.color, flexShrink: 0 }}>
                          ▸
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="minecraft-btn w-full py-3"
                    style={{
                      background: pkg.highlight
                        ? "oklch(0.55 0.25 295)"
                        : "oklch(0.20 0.09 295)",
                      color: "oklch(0.99 0 0)",
                      boxShadow: pkg.highlight
                        ? "0 4px 0 oklch(0.28 0.14 295), inset 0 2px 0 oklch(0.72 0.22 295)"
                        : "0 4px 0 oklch(0.10 0.04 295)",
                      fontSize: "0.55rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {pkg.price === "FREE" ? "PLAY FREE" : "GET RANK"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
