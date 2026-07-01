import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { useFadeIn } from "../hooks/useFadeIn";

function FadeSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useFadeIn<HTMLDivElement>(delay);
  return <div ref={ref}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Rule data — General Rules content preserved verbatim.              */
/* ------------------------------------------------------------------ */

interface OffenseTier {
  label: string;
  penalty: string;
}

interface RuleEntry {
  id: string;
  emoji: string;
  title: string;
  description: string;
  tiers: OffenseTier[];
  accentColor: string;
  borderColor: string;
  bgColor: string;
}

const RULES: RuleEntry[] = [
  {
    id: "respect",
    emoji: "🤝",
    title: "Respect All Players",
    description:
      "Harassment, racism, hate speech, offensive language, and bullying will not be tolerated.",
    accentColor: "oklch(0.70 0.20 145)",
    borderColor: "oklch(0.48 0.17 145)",
    bgColor: "oklch(0.14 0.06 145)",
    tiers: [
      { label: "1st Offense", penalty: "Warning" },
      { label: "2nd Offense", penalty: "1-day mute" },
      { label: "3rd Offense", penalty: "1-week ban" },
    ],
  },
  {
    id: "hacks",
    emoji: "🚫",
    title: "No Hacked Clients or Unfair Mods",
    description:
      "Usage of cheats such as X-ray, kill aura, fly hacks, autoclickers, or any mod providing an unfair advantage is strictly prohibited.",
    accentColor: "oklch(0.72 0.20 25)",
    borderColor: "oklch(0.50 0.18 25)",
    bgColor: "oklch(0.15 0.07 25)",
    tiers: [
      { label: "1st Offense", penalty: "1-week ban" },
      { label: "2nd Offense", penalty: "1-month ban" },
      { label: "3rd Offense", penalty: "Permanent ban" },
    ],
  },
  {
    id: "dupes",
    emoji: "📦",
    title: "No Duplication or Bug Exploits",
    description:
      "Exploiting glitches, bugs, or server errors to duplicate items or bypass mechanics is forbidden.",
    accentColor: "oklch(0.72 0.20 295)",
    borderColor: "oklch(0.50 0.18 295)",
    bgColor: "oklch(0.15 0.07 295)",
    tiers: [
      { label: "1st Offense", penalty: "Confiscation + 1-week ban" },
      { label: "2nd Offense", penalty: "1-month ban" },
      { label: "3rd Offense", penalty: "Permanent ban" },
    ],
  },
  {
    id: "lag",
    emoji: "⚙️",
    title: "No Lag Machines or Exploits",
    description:
      "Lag machines, intentional redstone clocks, and any mechanic designed to crash or destabilize the server are strictly forbidden.",
    accentColor: "oklch(0.70 0.20 55)",
    borderColor: "oklch(0.48 0.15 55)",
    bgColor: "oklch(0.14 0.05 55)",
    tiers: [
      { label: "Minor", penalty: "Warning + removal" },
      { label: "Moderate", penalty: "1–2 week ban + removal" },
      { label: "Major/Intentional", penalty: "Permanent ban" },
    ],
  },
  {
    id: "spam",
    emoji: "💬",
    title: "No Spamming or Command Abuse",
    description:
      "Spamming in chat, commands, or private messages is prohibited.",
    accentColor: "oklch(0.72 0.18 200)",
    borderColor: "oklch(0.50 0.16 200)",
    bgColor: "oklch(0.15 0.06 200)",
    tiers: [
      { label: "1st Offense", penalty: "30-min mute" },
      { label: "2nd Offense", penalty: "1-day mute" },
      { label: "3rd Offense", penalty: "1-week ban" },
    ],
  },
  {
    id: "scam",
    emoji: "🪙",
    title: "No Scamming",
    description:
      "Scamming in trades, shops, or player agreements is forbidden.",
    accentColor: "oklch(0.74 0.20 85)",
    borderColor: "oklch(0.52 0.18 85)",
    bgColor: "oklch(0.15 0.07 85)",
    tiers: [
      { label: "1st Offense", penalty: "Warning + item return if possible" },
      { label: "2nd Offense", penalty: "1-week ban" },
      { label: "3rd Offense", penalty: "1-month ban" },
    ],
  },
  {
    id: "offensive",
    emoji: "🔞",
    title: "No Offensive Content",
    description:
      "Offensive, inappropriate, or suggestive builds, usernames, and skins are not allowed.",
    accentColor: "oklch(0.70 0.22 350)",
    borderColor: "oklch(0.48 0.20 350)",
    bgColor: "oklch(0.14 0.07 350)",
    tiers: [
      { label: "1st Offense", penalty: "Warning + removal/change request" },
      { label: "2nd Offense", penalty: "Temporary ban until changed" },
      { label: "3rd Offense", penalty: "Permanent ban" },
    ],
  },
  {
    id: "impersonation",
    emoji: "🎭",
    title: "No Impersonation",
    description:
      "Pretending to be a staff member or another player is strictly prohibited.",
    accentColor: "oklch(0.72 0.20 320)",
    borderColor: "oklch(0.50 0.18 320)",
    bgColor: "oklch(0.15 0.07 320)",
    tiers: [
      { label: "1st Offense", penalty: "1-week ban" },
      { label: "2nd Offense", penalty: "Permanent ban" },
    ],
  },
  {
    id: "advertising",
    emoji: "📢",
    title: "No Advertising",
    description:
      "Advertising other servers, services, or Discord servers is forbidden.",
    accentColor: "oklch(0.72 0.19 165)",
    borderColor: "oklch(0.50 0.17 165)",
    bgColor: "oklch(0.15 0.06 165)",
    tiers: [
      { label: "1st Offense", penalty: "Warning" },
      { label: "2nd Offense", penalty: "1-week mute" },
      { label: "3rd Offense", penalty: "1-month ban" },
    ],
  },
  {
    id: "alt",
    emoji: "👥",
    title: "No Alt Account Abuse",
    description:
      "Alternate accounts cannot be used to bypass punishments or gain unfair advantages. Transferring resources between accounts is forbidden.",
    accentColor: "oklch(0.70 0.20 235)",
    borderColor: "oklch(0.48 0.18 235)",
    bgColor: "oklch(0.14 0.06 235)",
    tiers: [
      { label: "1st Offense", penalty: "Alt banned + warning on main" },
      { label: "2nd Offense", penalty: "1-month ban on all accounts" },
      { label: "3rd Offense", penalty: "Permanent ban on all accounts" },
    ],
  },
  {
    id: "staff-decisions",
    emoji: "📜",
    title: "Respect Staff Decisions",
    description:
      "Arguing with staff or refusing to follow instructions is not tolerated. Use tickets for appeals.",
    accentColor: "oklch(0.72 0.20 110)",
    borderColor: "oklch(0.50 0.18 110)",
    bgColor: "oklch(0.15 0.06 110)",
    tiers: [
      { label: "1st Offense", penalty: "Warning" },
      { label: "2nd Offense", penalty: "3-day mute" },
      { label: "3rd Offense", penalty: "1-week ban" },
    ],
  },
  {
    id: "lying",
    emoji: "🤥",
    title: "No Lying to Staff",
    description:
      "Providing false or misleading information to staff will not be tolerated.",
    accentColor: "oklch(0.70 0.22 20)",
    borderColor: "oklch(0.48 0.20 20)",
    bgColor: "oklch(0.14 0.07 20)",
    tiers: [
      { label: "1st Offense", penalty: "1-week ban" },
      { label: "2nd Offense", penalty: "Permanent ban" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Survival rules — gamemode-specific content.                         */
/* ------------------------------------------------------------------ */

const SURVIVAL_RULES: RuleEntry[] = [
  {
    id: "survival-hacks",
    emoji: "⚔️",
    title: "No Hacked Clients or Unfair Mods",
    description:
      "Usage of cheats such as X-ray, kill aura, fly hacks, or autoclickers is strictly forbidden.",
    accentColor: "oklch(0.72 0.20 25)",
    borderColor: "oklch(0.50 0.18 25)",
    bgColor: "oklch(0.15 0.07 25)",
    tiers: [
      { label: "1st Offense", penalty: "1-week ban" },
      { label: "2nd Offense", penalty: "1-month ban" },
      { label: "3rd Offense", penalty: "Permanent ban" },
    ],
  },
  {
    id: "survival-dupes",
    emoji: "📦",
    title: "No Duplication or Bug Exploits",
    description:
      "Exploiting glitches or bugs to duplicate items or bypass mechanics is prohibited.",
    accentColor: "oklch(0.72 0.20 295)",
    borderColor: "oklch(0.50 0.18 295)",
    bgColor: "oklch(0.15 0.07 295)",
    tiers: [
      { label: "1st Offense", penalty: "Confiscation + 1-week ban" },
      { label: "2nd Offense", penalty: "1-month ban" },
      { label: "3rd Offense", penalty: "Permanent ban" },
    ],
  },
  {
    id: "survival-trapping",
    emoji: "🪤",
    title: "No Spawn Trapping / Portal Trapping / TP Trapping",
    description:
      "Trapping players at respawn points, in portals, or via /tpa in a way that prevents them from playing is not allowed.",
    accentColor: "oklch(0.70 0.20 350)",
    borderColor: "oklch(0.48 0.18 350)",
    bgColor: "oklch(0.14 0.06 350)",
    tiers: [
      { label: "1st Offense", penalty: "Warning" },
      { label: "2nd Offense", penalty: "1-week ban" },
      { label: "3rd Offense", penalty: "1-month ban" },
    ],
  },
  {
    id: "survival-redstone",
    emoji: "🔴",
    title: "Redstone & Farm Restrictions",
    description:
      "Farms and redstone contraptions that cause excessive lag are forbidden. Staff may remove them without prior notice.",
    accentColor: "oklch(0.70 0.20 55)",
    borderColor: "oklch(0.48 0.15 55)",
    bgColor: "oklch(0.14 0.05 55)",
    tiers: [
      { label: "1st Offense", penalty: "Warning + removal" },
      { label: "2nd Offense", penalty: "1-week ban" },
      { label: "3rd Offense", penalty: "Permanent ban" },
    ],
  },
  {
    id: "survival-spirit",
    emoji: "🏕️",
    title: "Respect the Survival Spirit",
    description:
      "Offensive builds, excessive harassment, or blocking essential server features will not be tolerated.",
    accentColor: "oklch(0.72 0.20 145)",
    borderColor: "oklch(0.50 0.18 145)",
    bgColor: "oklch(0.15 0.06 145)",
    tiers: [
      { label: "1st Offense", penalty: "Warning + removal" },
      { label: "2nd Offense", penalty: "1-week ban" },
      { label: "3rd Offense", penalty: "Permanent ban" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Rule card — sub-panel within the main rules panel.                  */
/* ------------------------------------------------------------------ */

function RuleCard({ rule, index }: { rule: RuleEntry; index: number }) {
  return (
    <div
      data-ocid={`rules.item.${index + 1}`}
      className="p-4 sm:p-5"
      style={{
        background: rule.bgColor,
        border: `1px solid ${rule.borderColor}`,
        borderLeft: `4px solid ${rule.accentColor}`,
      }}
    >
      {/* Title row */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="font-pixel flex-shrink-0"
          style={{
            fontSize: "0.45rem",
            color: "oklch(0.40 0.08 295)",
            minWidth: "1.2rem",
            textAlign: "right",
          }}
        >
          #{index + 1}
        </span>
        <span
          style={{ fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}
          aria-hidden="true"
        >
          {rule.emoji}
        </span>
        <h3
          className="font-pixel"
          style={{
            fontSize: "0.6rem",
            color: rule.accentColor,
            letterSpacing: "0.06em",
            textShadow: "1px 1px 0 oklch(0.07 0.03 295)",
            lineHeight: 1.6,
          }}
        >
          {rule.title}
        </h3>
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: '"VT323", monospace',
          fontSize: "1.15rem",
          color: "oklch(0.82 0.06 295)",
          lineHeight: 1.5,
          marginBottom: "0.75rem",
        }}
      >
        {rule.description}
      </p>

      {/* Offense tiers */}
      <ul
        data-ocid={`rules.tiers.${index + 1}`}
        className="space-y-1"
        style={{ listStyle: "none", padding: 0, margin: 0 }}
      >
        {rule.tiers.map((tier, tIndex) => (
          <li
            key={tier.label}
            data-ocid={`rules.tier.${index + 1}.${tIndex + 1}`}
            className="flex items-start gap-2"
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.05rem",
              color: "oklch(0.75 0.10 295)",
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                color: rule.accentColor,
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              →
            </span>
            <span>
              <span
                style={{
                  color: "oklch(0.88 0.08 295)",
                  fontWeight: 700,
                }}
              >
                {tier.label}
              </span>{" "}
              <span style={{ color: "oklch(0.55 0.10 295)" }}>→</span>{" "}
              <span style={{ color: "oklch(0.78 0.12 295)" }}>
                {tier.penalty}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rules section — canonical content-panel pattern.                   */
/* ------------------------------------------------------------------ */

function RulesSection() {
  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ background: "oklch(0.09 0.04 295)" }}
    >
      <div className="absolute inset-0 block-texture opacity-15" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div
            className="inline-block px-4 py-1 mb-4 font-pixel"
            style={{
              background: "oklch(0.18 0.10 295)",
              border: "2px solid oklch(0.38 0.18 295)",
              color: "oklch(0.68 0.20 295)",
              fontSize: "0.5rem",
              letterSpacing: "0.15em",
            }}
          >
            RULES
          </div>
          <h2
            className="font-pixel mb-4"
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)",
              color: "oklch(0.97 0.01 295)",
              lineHeight: "1.8",
              textShadow: "3px 3px 0 oklch(0.08 0.04 295)",
            }}
          >
            General Rules
          </h2>
          <p
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.2rem",
              color: "oklch(0.70 0.12 295)",
              maxWidth: "42rem",
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Applies to all gamemodes: Survival, Skyblock, Towny, KitPvP,
            Bedwars, Bridge, TNT Run, Parkour and all Minigames.
          </p>
        </div>

        {/* Rules Panel */}
        <div
          className="relative"
          style={{
            background: "oklch(0.12 0.05 295)",
            border: "2px solid oklch(0.28 0.12 295)",
            boxShadow: "6px 6px 0 oklch(0.07 0.03 295)",
          }}
        >
          {/* Panel top bar */}
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: "oklch(0.18 0.10 295)",
              borderBottom: "2px solid oklch(0.28 0.12 295)",
            }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: "0.55rem",
                color: "oklch(0.75 0.20 295)",
                letterSpacing: "0.12em",
              }}
            >
              ⚖ SERVER RULES &amp; PENALTIES ⚖
            </span>
          </div>

          {/* Rule cards */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RULES.map((rule, index) => (
                <RuleCard key={rule.id} rule={rule} index={index} />
              ))}
            </div>

            {/* Disclaimer */}
            <div
              className="mt-5 px-4 py-3 flex items-start gap-3"
              style={{
                background: "oklch(0.13 0.06 295)",
                border: "1px solid oklch(0.28 0.12 295)",
                borderLeft: "4px solid oklch(0.55 0.18 295)",
              }}
            >
              <span
                style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}
                aria-hidden="true"
              >
                ⚠️
              </span>
              <p
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.1rem",
                  color: "oklch(0.62 0.12 295)",
                  lineHeight: 1.5,
                }}
              >
                Penalties may be escalated at staff discretion based on severity
                and prior history.
              </p>
            </div>
          </div>

          {/* Panel footer */}
          <div
            className="px-4 py-3 text-center"
            style={{
              borderTop: "2px solid oklch(0.22 0.08 295)",
              background: "oklch(0.11 0.05 295)",
            }}
          >
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1rem",
                color: "oklch(0.45 0.10 295)",
              }}
            >
              ★ Play fair. Have fun. Keep the community great. ★
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Survival rules section — mirrors RulesSection pattern.              */
/* ------------------------------------------------------------------ */

function SurvivalRulesSection() {
  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ background: "oklch(0.09 0.04 145)" }}
    >
      <div className="absolute inset-0 block-texture opacity-15" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div
            className="inline-block px-4 py-1 mb-4 font-pixel"
            style={{
              background: "oklch(0.18 0.10 145)",
              border: "2px solid oklch(0.38 0.18 145)",
              color: "oklch(0.68 0.20 145)",
              fontSize: "0.5rem",
              letterSpacing: "0.15em",
            }}
          >
            SURVIVAL
          </div>
          <h2
            className="font-pixel mb-4"
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)",
              color: "oklch(0.97 0.01 145)",
              lineHeight: "1.8",
              textShadow: "3px 3px 0 oklch(0.08 0.04 145)",
            }}
          >
            Survival Rules
          </h2>
          <p
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.2rem",
              color: "oklch(0.70 0.12 145)",
              maxWidth: "42rem",
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Raiding, griefing, stealing, and PvP are all allowed. The following
            rules ensure fair gameplay and server stability.
          </p>
        </div>

        {/* Rules Panel */}
        <div
          className="relative"
          style={{
            background: "oklch(0.12 0.05 145)",
            border: "2px solid oklch(0.28 0.12 145)",
            boxShadow: "6px 6px 0 oklch(0.07 0.03 145)",
          }}
        >
          {/* Panel top bar */}
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: "oklch(0.18 0.10 145)",
              borderBottom: "2px solid oklch(0.28 0.12 145)",
            }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: "0.55rem",
                color: "oklch(0.75 0.20 145)",
                letterSpacing: "0.12em",
              }}
            >
              ⚔ SURVIVAL GAMEMODE RULES ⚔
            </span>
          </div>

          {/* Rule cards */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SURVIVAL_RULES.map((rule, index) => (
                <RuleCard key={rule.id} rule={rule} index={index} />
              ))}
            </div>

            {/* Disclaimer */}
            <div
              className="mt-5 px-4 py-3 flex items-start gap-3"
              style={{
                background: "oklch(0.13 0.06 145)",
                border: "1px solid oklch(0.28 0.12 145)",
                borderLeft: "4px solid oklch(0.55 0.18 145)",
              }}
            >
              <span
                style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}
                aria-hidden="true"
              >
                ⚠️
              </span>
              <p
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.1rem",
                  color: "oklch(0.62 0.12 145)",
                  lineHeight: 1.5,
                }}
              >
                Penalties may be escalated at staff discretion based on severity
                and prior history.
              </p>
            </div>
          </div>

          {/* Panel footer */}
          <div
            className="px-4 py-3 text-center"
            style={{
              borderTop: "2px solid oklch(0.22 0.08 145)",
              background: "oklch(0.11 0.05 145)",
            }}
          >
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1rem",
                color: "oklch(0.45 0.10 145)",
              }}
            >
              ★ Survive. Thrive. Conquer the wild. ★
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page — matches Team.tsx structure.                                  */
/* ------------------------------------------------------------------ */

export default function Rules() {
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
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center">
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.25rem",
                color: "oklch(0.88 0.08 270)",
                lineHeight: 1.4,
              }}
            >
              ★ Read the rules before you play — ignorance is no excuse.
            </p>
          </div>
        </div>

        <FadeSection delay={0}>
          <RulesSection />
        </FadeSection>

        {/* Gamemode-specific intro */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "oklch(0.11 0.05 295)",
            borderTop: "2px solid oklch(0.22 0.10 295)",
            borderBottom: "2px solid oklch(0.22 0.10 295)",
          }}
        >
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.2rem",
                color: "oklch(0.72 0.10 295)",
                lineHeight: 1.5,
              }}
            >
              Gamemode-specific rules are listed in their respective sections
              below.
            </p>
          </div>
        </div>

        <FadeSection delay={100}>
          <SurvivalRulesSection />
        </FadeSection>
      </main>
      <Footer />
    </div>
  );
}
