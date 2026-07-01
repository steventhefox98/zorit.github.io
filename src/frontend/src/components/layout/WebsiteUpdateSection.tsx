import { Sparkles } from "lucide-react";

type ChangelogEntry = {
  tag: string;
  title: string;
  description: string;
};

const WEBSITE_CHANGELOG: ChangelogEntry[] = [
  {
    tag: "FEATURE",
    title: "Community Page Launch",
    description:
      "A brand-new Community hub centralizes guild spotlights, event calendars, and player submissions in one place.",
  },
  {
    tag: "DESIGN",
    title: "Navbar Redesign",
    description:
      "Streamlined navigation with pixel-bordered dropdowns, sticky scroll behavior, and clearer active-route indicators.",
  },
  {
    tag: "FEATURE",
    title: "Apply Page Added",
    description:
      "Aspiring staff members can now submit applications directly through a dedicated Apply page with role-specific forms.",
  },
  {
    tag: "PERFORMANCE",
    title: "Page Load Optimizer",
    description:
      "Code-splitting and asset caching cut average page load times by 35% across desktop and mobile devices.",
  },
  {
    tag: "DESIGN",
    title: "Dark Purple Theme",
    description:
      "Refreshed OKLCH purple palette deepens backgrounds and sharpens accent contrast for a more immersive feel.",
  },
];

const WEBSITE_TAG_STYLES: Record<
  string,
  { color: string; border: string; bg: string }
> = {
  FEATURE: {
    color: "oklch(0.75 0.20 145)",
    border: "oklch(0.55 0.18 145 / 0.5)",
    bg: "oklch(0.65 0.18 145 / 0.10)",
  },
  PERFORMANCE: {
    color: "oklch(0.80 0.14 200)",
    border: "oklch(0.55 0.14 200 / 0.5)",
    bg: "oklch(0.65 0.14 200 / 0.10)",
  },
  COMMUNITY: {
    color: "oklch(0.82 0.16 85)",
    border: "oklch(0.65 0.16 85 / 0.5)",
    bg: "oklch(0.78 0.16 85 / 0.10)",
  },
  BUGFIX: {
    color: "oklch(0.78 0.20 27)",
    border: "oklch(0.55 0.22 27 / 0.5)",
    bg: "oklch(0.58 0.24 27 / 0.10)",
  },
  DESIGN: {
    color: "oklch(0.78 0.20 330)",
    border: "oklch(0.55 0.20 330 / 0.5)",
    bg: "oklch(0.62 0.22 330 / 0.10)",
  },
};

export default function WebsiteUpdateSection() {
  return (
    <section
      id="whats-new"
      className="py-24 relative overflow-hidden"
      style={{ background: "oklch(0.09 0.05 295)" }}
    >
      <div className="absolute inset-0 block-texture opacity-20" />

      {/* Pulsing radial glow behind the panel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, oklch(0.55 0.25 295 / 0.22) 0%, transparent 70%)",
        }}
      />

      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-16 h-16 opacity-25"
        style={{
          background: "oklch(0.65 0.25 295)",
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-25"
        style={{
          background: "oklch(0.65 0.25 295)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-16 h-16 opacity-25"
        style={{
          background: "oklch(0.65 0.25 295)",
          clipPath: "polygon(0 0, 100% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-16 h-16 opacity-25"
        style={{
          background: "oklch(0.65 0.25 295)",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
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
            WEBSITE
          </div>
          <h2
            className="font-pixel mb-3"
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)",
              color: "oklch(0.97 0.01 295)",
              lineHeight: "1.8",
              textShadow: "3px 3px 0 oklch(0.10 0.04 295)",
            }}
          >
            What's New?
          </h2>
          <p
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.2rem",
              color: "oklch(0.65 0.12 295)",
              letterSpacing: "0.05em",
            }}
          >
            Latest Site Changes
          </p>
        </div>

        {/* The changelog panel — glowing + pulsing border */}
        <div
          className="relative p-6 sm:p-10 pulse-glow-anim"
          style={{
            background: "oklch(0.13 0.07 295)",
            border: "2px solid oklch(0.55 0.25 295)",
            boxShadow:
              "0 0 30px oklch(0.55 0.25 295 / 0.5), 6px 6px 0 oklch(0.08 0.03 295)",
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: "oklch(0.65 0.25 295)" }}
          />

          {/* SITE live badge */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-3 px-6 py-3 pixel-border-purple"
              style={{
                background: "oklch(0.18 0.10 295)",
                border: "2px solid oklch(0.65 0.25 295)",
              }}
            >
              <Sparkles size={18} style={{ color: "oklch(0.80 0.22 295)" }} />
              <span
                className="font-pixel"
                style={{
                  fontSize: "1rem",
                  color: "oklch(0.85 0.20 295)",
                  letterSpacing: "0.15em",
                  textShadow:
                    "0 0 12px oklch(0.65 0.25 295 / 0.7), 2px 2px 0 oklch(0.10 0.04 295)",
                }}
              >
                SITE
              </span>
              <span
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.1rem",
                  color: "oklch(0.55 0.10 295)",
                  letterSpacing: "0.08em",
                }}
              >
                / LIVE
              </span>
            </div>
          </div>

          {/* Changelog list */}
          <ul className="space-y-3" data-ocid="whats-new.changelog.list">
            {WEBSITE_CHANGELOG.map((entry, i) => {
              const tagStyle =
                WEBSITE_TAG_STYLES[entry.tag] ?? WEBSITE_TAG_STYLES.FEATURE;
              return (
                <li
                  key={entry.title}
                  data-ocid={`whats-new.item.${i + 1}`}
                  className="relative p-4 sm:p-5 transition-colors duration-150"
                  style={{
                    background: "oklch(0.10 0.04 295)",
                    border: "1px solid oklch(0.30 0.12 295)",
                    boxShadow: "inset 0 -2px 0 0 oklch(0.08 0.03 295)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {/* Tag */}
                    <span
                      className="inline-flex items-center self-start font-pixel flex-shrink-0"
                      style={{
                        fontSize: "0.5rem",
                        letterSpacing: "0.08em",
                        color: tagStyle.color,
                        border: `1px solid ${tagStyle.border}`,
                        background: tagStyle.bg,
                        padding: "0.3rem 0.5rem",
                      }}
                    >
                      {entry.tag}
                    </span>
                    {/* Title + description */}
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-pixel mb-2"
                        style={{
                          fontSize: "0.65rem",
                          color: "oklch(0.92 0.04 295)",
                          letterSpacing: "0.04em",
                          lineHeight: "1.6",
                          textShadow: "1px 1px 0 oklch(0.10 0.04 295)",
                        }}
                      >
                        {entry.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: '"VT323", monospace',
                          fontSize: "1.1rem",
                          color: "oklch(0.70 0.08 295)",
                          letterSpacing: "0.02em",
                          lineHeight: "1.4",
                        }}
                      >
                        {entry.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Decorative pulsing dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  background: "oklch(0.65 0.22 295)",
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Sub note */}
        <p
          className="text-center mt-6"
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: "1.1rem",
            color: "oklch(0.55 0.10 295)",
            letterSpacing: "0.03em",
          }}
        >
          ★ The ZoritLegends website keeps evolving — check back for the latest
          site improvements.
        </p>
      </div>
    </section>
  );
}
