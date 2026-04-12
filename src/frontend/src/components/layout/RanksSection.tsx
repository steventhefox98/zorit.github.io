import { useState } from "react";

interface Rank {
  name: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  price: string;
  tier: number;
  perks: {
    auctions: number;
    spawnerDiscount: number;
    shopDiscount: number;
    maxHomes: number | null;
    commands: string[];
    inheritsFrom?: string;
  };
}

const ranks: Rank[] = [
  {
    name: "Crusader",
    emoji: "🌱",
    color: "oklch(0.60 0.15 145)",
    borderColor: "oklch(0.40 0.12 145)",
    bgColor: "oklch(0.14 0.06 145)",
    description: "Begin your journey",
    price: "500K",
    tier: 1,
    perks: {
      auctions: 5,
      spawnerDiscount: 5,
      shopDiscount: 5,
      maxHomes: null,
      commands: ["/skulls", "/kits crusader"],
    },
  },
  {
    name: "Knight",
    emoji: "⚔️",
    color: "oklch(0.60 0.18 220)",
    borderColor: "oklch(0.42 0.15 220)",
    bgColor: "oklch(0.14 0.06 220)",
    description: "Sharpen your skills",
    price: "1M",
    tier: 2,
    perks: {
      auctions: 8,
      spawnerDiscount: 10,
      shopDiscount: 10,
      maxHomes: 10,
      commands: ["/kits knight", "/lay"],
      inheritsFrom: "Crusader",
    },
  },
  {
    name: "Elite",
    emoji: "🔥",
    color: "oklch(0.65 0.22 25)",
    borderColor: "oklch(0.45 0.18 25)",
    bgColor: "oklch(0.14 0.06 25)",
    description: "Command the battlefield",
    price: "1.5M",
    tier: 3,
    perks: {
      auctions: 12,
      spawnerDiscount: 15,
      shopDiscount: 15,
      maxHomes: 12,
      commands: ["/crawl", "/kits elite"],
      inheritsFrom: "Knight",
    },
  },
  {
    name: "Champion",
    emoji: "🏆",
    color: "oklch(0.72 0.20 80)",
    borderColor: "oklch(0.52 0.18 80)",
    bgColor: "oklch(0.14 0.06 80)",
    description: "Rise above the rest",
    price: "2M",
    tier: 4,
    perks: {
      auctions: 15,
      spawnerDiscount: 20,
      shopDiscount: 20,
      maxHomes: 15,
      commands: ["/kits champion"],
      inheritsFrom: "Elite",
    },
  },
  {
    name: "Legend",
    emoji: "👑",
    color: "oklch(0.75 0.22 295)",
    borderColor: "oklch(0.55 0.22 295)",
    bgColor: "oklch(0.18 0.10 295)",
    description: "Forge your legacy",
    price: "3M",
    tier: 5,
    perks: {
      auctions: 18,
      spawnerDiscount: 25,
      shopDiscount: 25,
      maxHomes: 18,
      commands: [
        "/fly",
        "/heal",
        "/repair",
        "/time",
        "/weather",
        "/bellyflop",
        "/kits legend",
      ],
      inheritsFrom: "Champion",
    },
  },
  {
    name: "Mythic",
    emoji: "🌀",
    color: "oklch(0.70 0.28 310)",
    borderColor: "oklch(0.50 0.24 310)",
    bgColor: "oklch(0.16 0.10 310)",
    description: "Beyond mortal limits",
    price: "5M",
    tier: 6,
    perks: {
      auctions: 21,
      spawnerDiscount: 30,
      shopDiscount: 30,
      maxHomes: 21,
      commands: ["/nick", "/kits mythic"],
      inheritsFrom: "Legend",
    },
  },
  {
    name: "Ancient",
    emoji: "🏛️",
    color: "oklch(0.73 0.20 55)",
    borderColor: "oklch(0.53 0.18 55)",
    bgColor: "oklch(0.16 0.08 55)",
    description: "Wisdom of the ages",
    price: "10M",
    tier: 7,
    perks: {
      auctions: 24,
      spawnerDiscount: 35,
      shopDiscount: 35,
      maxHomes: 24,
      commands: ["/spin", "/kits ancient"],
      inheritsFrom: "Mythic",
    },
  },
  {
    name: "Divine",
    emoji: "✨",
    color: "oklch(0.88 0.18 100)",
    borderColor: "oklch(0.68 0.18 100)",
    bgColor: "oklch(0.16 0.07 100)",
    description: "Touched by the gods",
    price: "20M",
    tier: 8,
    perks: {
      auctions: 27,
      spawnerDiscount: 40,
      shopDiscount: 40,
      maxHomes: 27,
      commands: ["/kits divine"],
      inheritsFrom: "Ancient",
    },
  },
  {
    name: "Devil",
    emoji: "😈",
    color: "oklch(0.60 0.28 15)",
    borderColor: "oklch(0.42 0.24 15)",
    bgColor: "oklch(0.16 0.10 15)",
    description: "Embrace the darkness",
    price: "30M",
    tier: 9,
    perks: {
      auctions: 30,
      spawnerDiscount: 45,
      shopDiscount: 45,
      maxHomes: 30,
      commands: ["/kits devil"],
      inheritsFrom: "Divine",
    },
  },
  {
    name: "God",
    emoji: "⚡",
    color: "oklch(0.90 0.22 90)",
    borderColor: "oklch(0.70 0.22 90)",
    bgColor: "oklch(0.18 0.10 90)",
    description: "Absolute supreme power",
    price: "40M",
    tier: 10,
    perks: {
      auctions: 33,
      spawnerDiscount: 50,
      shopDiscount: 50,
      maxHomes: 33,
      commands: ["/kits god"],
      inheritsFrom: "Devil",
    },
  },
];

function RankPerksModal({
  rank,
  onClose,
}: { rank: Rank; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
        style={{
          background: rank.bgColor,
          border: `2px solid ${rank.color}`,
          boxShadow: `0 0 40px ${rank.color}60, 6px 6px 0 oklch(0.05 0.03 295)`,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: rank.color }}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center font-pixel text-xs transition-opacity hover:opacity-70"
          style={{
            color: rank.color,
            border: `1px solid ${rank.borderColor}`,
            background: "oklch(0.10 0.04 295)",
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              border: `2px solid ${rank.color}`,
              background: "oklch(0.10 0.04 295)",
            }}
          >
            {rank.emoji}
          </div>
          <div>
            <div
              className="font-pixel"
              style={{
                fontSize: "0.8rem",
                color: rank.color,
                letterSpacing: "0.1em",
              }}
            >
              {rank.name}
            </div>
            <div
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1rem",
                color: "oklch(0.55 0.08 295)",
              }}
            >
              {rank.description}
            </div>
            <div
              className="inline-block px-2 py-0.5 mt-1 font-pixel"
              style={{
                background: "oklch(0.10 0.04 295)",
                border: `1px solid ${rank.color}`,
                color: rank.color,
                fontSize: "0.4rem",
              }}
            >
              💰 {rank.price} IN-GAME
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 gap-2 mb-4 p-3"
          style={{
            border: `1px solid ${rank.borderColor}`,
            background: "oklch(0.10 0.04 295)",
          }}
        >
          <div className="text-center p-2">
            <div
              className="font-pixel"
              style={{
                fontSize: "0.55rem",
                color: rank.color,
                letterSpacing: "0.05em",
              }}
            >
              AUCTIONS
            </div>
            <div
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.6rem",
                color: "oklch(0.90 0.05 295)",
              }}
            >
              {rank.perks.auctions}%
            </div>
          </div>
          <div className="text-center p-2">
            <div
              className="font-pixel"
              style={{
                fontSize: "0.55rem",
                color: rank.color,
                letterSpacing: "0.05em",
              }}
            >
              SPAWNER DISC.
            </div>
            <div
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.6rem",
                color: "oklch(0.90 0.05 295)",
              }}
            >
              {rank.perks.spawnerDiscount}%
            </div>
          </div>
          <div className="text-center p-2">
            <div
              className="font-pixel"
              style={{
                fontSize: "0.55rem",
                color: rank.color,
                letterSpacing: "0.05em",
              }}
            >
              SHOP DISC.
            </div>
            <div
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.6rem",
                color: "oklch(0.90 0.05 295)",
              }}
            >
              {rank.perks.shopDiscount}%
            </div>
          </div>
          {rank.perks.maxHomes !== null && (
            <div className="text-center p-2">
              <div
                className="font-pixel"
                style={{
                  fontSize: "0.55rem",
                  color: rank.color,
                  letterSpacing: "0.05em",
                }}
              >
                MAX HOMES
              </div>
              <div
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.6rem",
                  color: "oklch(0.90 0.05 295)",
                }}
              >
                {rank.perks.maxHomes}
              </div>
            </div>
          )}
        </div>

        {/* Commands */}
        <div className="mb-4">
          <div
            className="font-pixel mb-2"
            style={{
              fontSize: "0.5rem",
              color: rank.color,
              letterSpacing: "0.1em",
            }}
          >
            EXCLUSIVE COMMANDS
          </div>
          <div className="flex flex-wrap gap-2">
            {rank.perks.commands.map((cmd) => (
              <span
                key={cmd}
                className="px-2 py-1"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1rem",
                  color: rank.color,
                  border: `1px solid ${rank.borderColor}`,
                  background: "oklch(0.10 0.04 295)",
                }}
              >
                {cmd}
              </span>
            ))}
          </div>
        </div>

        {/* Inherits from */}
        {rank.perks.inheritsFrom && (
          <div
            className="p-3"
            style={{
              border: `1px solid ${rank.borderColor}`,
              background: "oklch(0.10 0.04 295)",
            }}
          >
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "0.95rem",
                color: "oklch(0.55 0.10 295)",
              }}
            >
              ★ Includes all perks from {rank.perks.inheritsFrom} and below
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RanksSection() {
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);

  return (
    <section
      id="ranks"
      className="py-24 relative overflow-hidden"
      style={{ background: "oklch(0.10 0.05 295)" }}
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
            PROGRESSION
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
            Server Ranks
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
            Earn your place through skill and dedication — click any rank to
            view perks
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {ranks.map((rank) => (
            <div
              key={rank.name}
              className="relative flex flex-col items-center text-center p-6 transition-all duration-300 cursor-pointer"
              style={{
                background: rank.bgColor,
                border: `2px solid ${rank.borderColor}`,
                boxShadow: "4px 4px 0 oklch(0.07 0.03 295)",
              }}
              onClick={() => setSelectedRank(rank)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedRank(rank)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = rank.color;
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `4px 4px 0 oklch(0.07 0.03 295), 0 0 16px ${rank.color}40`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  rank.borderColor;
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "4px 4px 0 oklch(0.07 0.03 295)";
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: rank.color }}
              />

              <div
                className="w-14 h-14 flex items-center justify-center mb-4 mt-2"
                style={{
                  background: "oklch(0.10 0.04 295)",
                  border: `2px solid ${rank.color}`,
                  fontSize: "1.6rem",
                }}
              >
                {rank.emoji}
              </div>

              <div
                className="font-pixel mb-1"
                style={{
                  fontSize: "0.65rem",
                  color: rank.color,
                  textShadow: "1px 1px 0 oklch(0.08 0.03 295)",
                  letterSpacing: "0.08em",
                }}
              >
                {rank.name}
              </div>

              <p
                className="mb-3"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "0.95rem",
                  color: "oklch(0.60 0.08 295)",
                  lineHeight: "1.4",
                }}
              >
                {rank.description}
              </p>

              <div
                className="mt-auto px-3 py-1 font-pixel"
                style={{
                  background: "oklch(0.10 0.04 295)",
                  border: `1px solid ${rank.color}`,
                  color: rank.color,
                  fontSize: "0.45rem",
                  letterSpacing: "0.08em",
                }}
              >
                💰 {rank.price} IN-GAME
              </div>

              {/* Click hint */}
              <div
                className="mt-2 font-pixel"
                style={{
                  fontSize: "0.35rem",
                  color: "oklch(0.45 0.08 295)",
                  letterSpacing: "0.06em",
                }}
              >
                CLICK FOR PERKS
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-10 text-center p-5"
          style={{
            background: "oklch(0.13 0.06 295)",
            border: "2px solid oklch(0.25 0.10 295)",
          }}
        >
          <p
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.1rem",
              color: "oklch(0.55 0.10 295)",
            }}
          >
            ★ Ranks are purchased with in-game money — no real money required.
            Play, earn, and climb the ladder!
          </p>
        </div>
      </div>

      {selectedRank && (
        <RankPerksModal
          rank={selectedRank}
          onClose={() => setSelectedRank(null)}
        />
      )}
    </section>
  );
}
