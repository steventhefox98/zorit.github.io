import { Role, RosterRank } from "@/backend";
import type { Message, StaffDirectoryEntry } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSendStaffMessage,
  useStaffConversation,
  useStaffDirectory,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Loader2,
  MessageSquare,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { useFadeIn } from "../hooks/useFadeIn";

/* ------------------------------------------------------------------ */
/*  Layout helpers                                                     */
/* ------------------------------------------------------------------ */

function FadeSection({
  children,
  delay = 0,
}: { children: React.ReactNode; delay?: number }) {
  const ref = useFadeIn<HTMLDivElement>(delay);
  return <div ref={ref}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Display maps                                                       */
/* ------------------------------------------------------------------ */

/*
 * StaffDirectoryEntry.role is now the full AuthTypes.Role (15 variants:
 * #Administrator, #CoAdministrator, #Member + 13 roster ranks). The backend
 * isStaffRole returns true for all roster ranks + Administrator +
 * CoAdministrator, so the Messages page grants access to any accepted staff
 * member — not only Administrator/CoAdministrator.
 *
 * After acceptance a user's role becomes #Administrator or #CoAdministrator
 * (never a roster rank), so the role alone no longer tells us which roster
 * rank they hold. StaffDirectoryEntry.rank (optional ?RosterRank) carries that
 * information — when present we display the rank label from
 * RANK_LABELS_BY_RANK; when null we fall back to the role-based
 * ADMIN/CO-ADMIN badge.
 *
 * Rank labels mirror the canonical RANK_LABELS in StaffListSection.tsx and
 * the RANK_OPTIONS in Admin.tsx so the Team page, Admin rank picker, and
 * staff directory all show identical rank strings.
 */
const RANK_LABELS: Partial<Record<Role, string>> = {
  [Role.Owner]: "Owner",
  [Role.CoOwner]: "Co-Owner",
  [Role.Manager]: "Manager",
  [Role.AdvertiseManager]: "Advertise Manager",
  [Role.ChiefAdmin]: "Chief Admin",
  [Role.SrDeveloper]: "SR. Developer",
  [Role.Developer]: "Developer",
  [Role.Admin]: "Admin",
  [Role.JrAdmin]: "JR. Admin",
  [Role.Mod]: "Mod",
  [Role.Cop]: "Cop",
  [Role.Builder]: "Builder",
  [Role.SrCop]: "Sr-Cop",
};

/*
 * RosterRank-keyed labels for the new StaffDirectoryEntry.rank field. The
 * string values intentionally match RANK_LABELS above so the directory shows
 * the same rank strings whether the rank arrives via role (pre-acceptance)
 * or via the rank field (post-acceptance).
 */
const RANK_LABELS_BY_RANK: Partial<Record<RosterRank, string>> = {
  [RosterRank.Owner]: "Owner",
  [RosterRank.CoOwner]: "Co-Owner",
  [RosterRank.Manager]: "Manager",
  [RosterRank.AdvertiseManager]: "Advertise Manager",
  [RosterRank.ChiefAdmin]: "Chief Admin",
  [RosterRank.SrDeveloper]: "SR. Developer",
  [RosterRank.Developer]: "Developer",
  [RosterRank.Admin]: "Admin",
  [RosterRank.JrAdmin]: "JR. Admin",
  [RosterRank.Mod]: "Mod",
  [RosterRank.Cop]: "Cop",
  [RosterRank.Builder]: "Builder",
  [RosterRank.SrCop]: "Sr-Cop",
};

const ROSTER_RANK_ROLES = new Set<Role>([
  Role.Owner,
  Role.CoOwner,
  Role.Manager,
  Role.AdvertiseManager,
  Role.ChiefAdmin,
  Role.SrDeveloper,
  Role.Developer,
  Role.Admin,
  Role.JrAdmin,
  Role.Mod,
  Role.Cop,
  Role.Builder,
  Role.SrCop,
]);

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

/*
 * Access check aligned with the backend isStaffRole: any roster-rank role
 * OR Administrator OR CoAdministrator qualifies for staff messaging. A
 * newly-accepted applicant (who holds a roster-rank Role) is therefore
 * granted access.
 */
function isStaffRole(role: Role | null): boolean {
  if (role === null) return false;
  return (
    role === Role.Administrator ||
    role === Role.CoAdministrator ||
    ROSTER_RANK_ROLES.has(role)
  );
}

function formatTimestamp(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  if (!Number.isFinite(ms) || ms <= 0) return "Unknown";
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (sameDay) return time;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
 * Resolve a directory entry's role + optional rank to a badge class + label.
 * When the entry carries a roster rank (post-acceptance), the rank label from
 * RANK_LABELS_BY_RANK is displayed on the member badge. When rank is null
 * (pre-acceptance, or an admin who is not on the roster), Administrator /
 * CoAdministrator keep their dedicated admin/coadmin badges and any roster-
 * rank role falls back to its role-based rank label.
 */
function badgeForRole(
  role: Role,
  rank: RosterRank | null | undefined,
): { className: string; label: string } {
  if (rank !== null && rank !== undefined) {
    const rankLabel = RANK_LABELS_BY_RANK[rank];
    if (rankLabel) {
      return { className: "role-badge role-member", label: rankLabel };
    }
  }
  if (role === Role.Administrator) {
    return { className: "role-badge role-admin", label: "ADMIN" };
  }
  if (role === Role.CoAdministrator) {
    return { className: "role-badge role-coadmin", label: "CO-ADMIN" };
  }
  const rankLabel = RANK_LABELS[role];
  if (rankLabel) {
    return { className: "role-badge role-member", label: rankLabel };
  }
  return { className: "role-badge role-member", label: "STAFF" };
}

/* ------------------------------------------------------------------ */
/*  Access-denied state                                                */
/* ------------------------------------------------------------------ */

function AccessDenied({ authenticated }: { authenticated: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "oklch(0.13 0.08 295)",
        borderBottom: "2px solid oklch(0.32 0.18 295)",
      }}
    >
      <div className="absolute inset-0 block-texture opacity-10" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div
          className="mx-auto mb-6 flex items-center justify-center"
          style={{ width: "64px", height: "64px" }}
        >
          <ShieldAlert
            size={56}
            style={{ color: "oklch(0.62 0.24 27)" }}
            aria-hidden
          />
        </div>
        <h2
          className="font-pixel"
          style={{
            fontSize: "0.9rem",
            color: "oklch(0.97 0.01 295)",
            letterSpacing: "0.08em",
          }}
        >
          ACCESS DENIED
        </h2>
        <p
          className="mt-5"
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: "1.25rem",
            color: "oklch(0.65 0.10 295)",
            lineHeight: 1.5,
          }}
        >
          {authenticated
            ? "You don't have permission to view staff messages. Only accepted staff members can use staff messaging."
            : "You must be signed in as an accepted staff member to access staff messaging."}
        </p>
        <button
          type="button"
          data-ocid="messages.back_home_button"
          onClick={() => navigate({ to: "/" })}
          className="minecraft-btn mt-8 px-6 py-3"
          style={{
            background: "oklch(0.55 0.25 295)",
            color: "oklch(0.99 0 0)",
            boxShadow:
              "0 3px 0 oklch(0.30 0.15 295), inset 0 1px 0 oklch(0.70 0.22 295)",
            fontSize: "0.55rem",
            letterSpacing: "0.08em",
            border: "2px solid oklch(0.40 0.18 295)",
            cursor: "pointer",
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
          ▸ BACK TO HOME
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Initial-tile avatar fallback                                       */
/* ------------------------------------------------------------------ */

/*
 * Lightweight text-initial tile that replaces the removed UserAvatar
 * component. Renders the first character of a username in the pixel font
 * on a staff-tinted background. Sizes: "sm" (message meta) and "md"
 * (sidebar list).
 */
function InitialTile({
  username,
  size = "md",
}: {
  username: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? 22 : 36;
  const fontSize = size === "sm" ? "0.5rem" : "0.7rem";
  const initial = (username?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <span
      aria-hidden
      className="flex-shrink-0 flex items-center justify-center font-pixel"
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        fontSize,
        letterSpacing: "0.04em",
        background: "oklch(0.18 0.08 295)",
        border: "2px solid oklch(0.40 0.18 295)",
        color: "oklch(0.85 0.12 295)",
        imageRendering: "pixelated",
      }}
    >
      {initial}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar staff list                                                 */
/* ------------------------------------------------------------------ */

// Filter out the current user; sort Administrators first, then
// CoAdministrators, then roster ranks by canonical RosterRank order, then
// alphabetical by username as a final tiebreaker. When an entry carries a
// roster rank (post-acceptance), that rank drives the ordering instead of
// the (now Administrator/CoAdministrator) role.
const STAFF_RANK_ORDER: RosterRank[] = [
  RosterRank.Owner,
  RosterRank.CoOwner,
  RosterRank.Manager,
  RosterRank.AdvertiseManager,
  RosterRank.ChiefAdmin,
  RosterRank.SrDeveloper,
  RosterRank.Developer,
  RosterRank.Admin,
  RosterRank.JrAdmin,
  RosterRank.Mod,
  RosterRank.Cop,
  RosterRank.Builder,
  RosterRank.SrCop,
];

const staffRankIndex = (
  role: Role,
  rank: RosterRank | null | undefined,
): number => {
  if (rank !== null && rank !== undefined) {
    const idx = STAFF_RANK_ORDER.indexOf(rank);
    return idx === -1 ? STAFF_RANK_ORDER.length : idx;
  }
  if (role === Role.Administrator) return -2;
  if (role === Role.CoAdministrator) return -1;
  const roleIdx = STAFF_RANK_ORDER.indexOf(role as unknown as RosterRank);
  return roleIdx === -1 ? STAFF_RANK_ORDER.length : roleIdx;
};

interface StaffListProps {
  entries: StaffDirectoryEntry[];
  currentUsername: string;
  activePeer: string | null;
  onSelect: (username: string) => void;
  isLoading: boolean;
  isError: boolean;
}

function StaffList({
  entries,
  currentUsername,
  activePeer,
  onSelect,
  isLoading,
  isError,
}: StaffListProps) {
  const visible = useMemo(() => {
    return entries
      .filter((e) => e.username !== currentUsername)
      .sort((a, b) => {
        const aRank = staffRankIndex(a.role, a.rank);
        const bRank = staffRankIndex(b.role, b.rank);
        if (aRank !== bRank) return aRank - bRank;
        return a.username.localeCompare(b.username);
      });
  }, [entries, currentUsername]);

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-3 border-b-2"
        style={{
          background: "oklch(0.14 0.06 295)",
          borderColor: "oklch(0.32 0.14 295)",
        }}
      >
        <Users size={14} style={{ color: "oklch(0.7 0.22 295)" }} />
        <span
          className="font-pixel"
          style={{
            fontSize: "0.55rem",
            color: "oklch(0.85 0.12 295)",
            letterSpacing: "0.08em",
          }}
        >
          STAFF DIRECTORY
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ background: "oklch(0.10 0.04 295)" }}
      >
        {isLoading ? (
          <div
            data-ocid="messages.directory.loading_state"
            className="flex items-center justify-center gap-2 py-10"
            style={{
              fontFamily: '"VT323", monospace',
              color: "oklch(0.55 0.10 295)",
              fontSize: "1.05rem",
            }}
          >
            <Loader2
              size={14}
              className="animate-spin"
              style={{ color: "oklch(0.62 0.22 295)" }}
            />
            LOADING STAFF...
          </div>
        ) : isError ? (
          <div
            data-ocid="messages.directory.error_state"
            className="flex items-center gap-2 px-4 py-6"
            style={{
              fontFamily: '"VT323", monospace',
              color: "oklch(0.62 0.24 27)",
              fontSize: "1rem",
            }}
          >
            <AlertTriangle size={14} />
            Failed to load staff.
          </div>
        ) : visible.length === 0 ? (
          <div
            data-ocid="messages.directory.empty_state"
            className="px-4 py-10 text-center"
            style={{
              fontFamily: '"VT323", monospace',
              color: "oklch(0.55 0.10 295)",
              fontSize: "1.05rem",
            }}
          >
            No other staff members found.
          </div>
        ) : (
          <ul className="py-2">
            {visible.map((entry, i) => {
              const isActive = activePeer === entry.username;
              const badge = badgeForRole(entry.role, entry.rank);
              return (
                <li key={entry.username}>
                  <button
                    type="button"
                    data-ocid={`messages.staff.item.${i + 1}`}
                    onClick={() => onSelect(entry.username)}
                    className="w-full text-left px-3 py-3 flex items-center gap-3 transition-colors duration-150 border-0 cursor-pointer"
                    style={{
                      background: isActive
                        ? "oklch(0.20 0.10 295)"
                        : "transparent",
                      borderLeft: isActive
                        ? "3px solid oklch(0.62 0.22 295)"
                        : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.background =
                          "oklch(0.16 0.08 295)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                    }}
                  >
                    {/* Initial-tile fallback (avatar feature removed) */}
                    <InitialTile username={entry.username} size="md" />
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-pixel truncate"
                        style={{
                          fontSize: "0.55rem",
                          color: isActive
                            ? "oklch(0.97 0.01 295)"
                            : "oklch(0.82 0.10 295)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {entry.username}
                      </div>
                      <div className="mt-1.5">
                        <span className={badge.className}>{badge.label}</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Message bubble                                                     */
/* ------------------------------------------------------------------ */

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderRole: Role | null;
  senderRank: RosterRank | null | undefined;
  index: number;
  /** Current user's username — used to render own-message meta line. */
  currentUsername: string;
}

function MessageBubble({
  message,
  isOwn,
  senderRole,
  senderRank,
  index,
  currentUsername,
}: MessageBubbleProps) {
  const badge =
    senderRole !== null ? badgeForRole(senderRole, senderRank) : null;

  // Discord-style: every message (own + peer) renders an initial-tile +
  // name + inline timestamp meta line above the bubble.
  const metaUsername = isOwn ? currentUsername : message.senderUsername;

  return (
    <div
      data-ocid={`messages.bubble.item.${index + 1}`}
      className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}
      >
        {/* Sender meta line — initial-tile + name + inline timestamp (all messages) */}
        <div
          className={`flex items-center gap-2 mb-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
        >
          <InitialTile username={metaUsername} size="sm" />
          <span
            className="font-pixel"
            style={{
              fontSize: "0.5rem",
              color: "oklch(0.82 0.10 295)",
              letterSpacing: "0.04em",
            }}
          >
            {metaUsername}
          </span>
          {badge && <span className={badge.className}>{badge.label}</span>}
          {/* Inline timestamp next to sender name (Discord-style) */}
          <span
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "0.95rem",
              color: "oklch(0.50 0.08 295)",
              letterSpacing: "0.04em",
            }}
          >
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <div
          className="relative px-3 py-2"
          style={
            isOwn
              ? {
                  background: "oklch(0.55 0.22 295)",
                  color: "oklch(0.99 0 0)",
                  border: "2px solid oklch(0.40 0.18 295)",
                  boxShadow: "3px 3px 0 oklch(0.10 0.04 295)",
                }
              : {
                  background: "oklch(0.16 0.07 295)",
                  color: "oklch(0.95 0.02 295)",
                  border: "2px solid oklch(0.32 0.12 295)",
                  boxShadow: "3px 3px 0 oklch(0.10 0.04 295)",
                }
          }
        >
          <p
            className="break-words"
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: "0.95rem",
              lineHeight: 1.45,
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chat panel                                                         */
/* ------------------------------------------------------------------ */

interface ChatPanelProps {
  peer: StaffDirectoryEntry | null;
  currentUsername: string;
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onSend: (content: string) => void;
  sending: boolean;
}

function ChatPanel({
  peer,
  currentUsername,
  messages,
  isLoading,
  isError,
  error,
  onSend,
  sending,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  const lastPeerRef = useRef<string | null>(null);

  // Defense in depth: even though the backend rejects self-messages and the
  // StaffList filters out the current user, a stale directory entry or a
  // direct selection could still surface the current user as the peer. We
  // disable the composer and show a friendly hint in that case.
  const isSelfPeer =
    !!peer && !!currentUsername && peer.username === currentUsername;

  // Auto-scroll to latest on new messages, on poll refresh, and on peer switch.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const peerKey = peer?.username ?? null;
    const switchedPeer = peerKey !== lastPeerRef.current;
    const grew = messages.length > lastCountRef.current;
    lastPeerRef.current = peerKey;
    lastCountRef.current = messages.length;
    if (switchedPeer || grew) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, peer?.username]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || !peer || sending || isSelfPeer) return;
    onSend(trimmed);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // No recipient selected — pixel-art placeholder.
  if (!peer) {
    return (
      <div
        data-ocid="messages.chat.empty_state"
        className="relative h-full flex items-center justify-center overflow-hidden"
        style={{
          background: "oklch(0.10 0.04 295)",
          border: "2px solid oklch(0.30 0.10 295)",
        }}
      >
        <div className="absolute inset-0 block-texture opacity-10" />
        <div className="relative z-10 text-center px-6">
          <div
            className="mx-auto mb-6 flex items-center justify-center"
            style={{ width: "72px", height: "72px" }}
          >
            <MessageSquare
              size={56}
              style={{ color: "oklch(0.55 0.18 295)" }}
              aria-hidden
            />
          </div>
          <h3
            className="font-pixel"
            style={{
              fontSize: "0.7rem",
              color: "oklch(0.85 0.12 295)",
              letterSpacing: "0.08em",
            }}
          >
            SELECT A STAFF MEMBER
          </h3>
          <p
            className="mt-4"
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.2rem",
              color: "oklch(0.55 0.10 295)",
              lineHeight: 1.5,
            }}
          >
            Pick a recipient from the sidebar to start a private 1:1
            conversation.
          </p>
        </div>
      </div>
    );
  }

  const peerBadge = badgeForRole(peer.role, peer.rank);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "oklch(0.10 0.04 295)",
        border: "2px solid oklch(0.30 0.10 295)",
      }}
    >
      {/* Chat header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b-2"
        style={{
          background: "oklch(0.14 0.06 295)",
          borderColor: "oklch(0.32 0.14 295)",
        }}
      >
        <span
          aria-hidden
          style={{
            width: "8px",
            height: "8px",
            background: "oklch(0.65 0.18 145)",
            boxShadow: "0 0 6px oklch(0.65 0.18 145 / 0.7)",
            imageRendering: "pixelated",
          }}
        />
        <span
          className="font-pixel truncate"
          style={{
            fontSize: "0.6rem",
            color: "oklch(0.97 0.01 295)",
            letterSpacing: "0.05em",
          }}
        >
          {peer.username}
        </span>
        <span className={peerBadge.className}>{peerBadge.label}</span>
      </div>

      {/* Messages scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ background: "oklch(0.08 0.03 295)" }}
      >
        {isLoading ? (
          <div
            data-ocid="messages.chat.loading_state"
            className="flex items-center justify-center gap-2 py-12"
            style={{
              fontFamily: '"VT323", monospace',
              color: "oklch(0.55 0.10 295)",
              fontSize: "1.1rem",
            }}
          >
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "oklch(0.62 0.22 295)" }}
            />
            LOADING CONVERSATION...
          </div>
        ) : isError ? (
          <div
            data-ocid="messages.chat.error_state"
            className="text-center py-12 px-6"
            style={{
              background: "oklch(0.14 0.06 295)",
              border: "2px solid oklch(0.50 0.18 27)",
              boxShadow: "4px 4px 0px oklch(0.08 0.04 295)",
            }}
          >
            <AlertTriangle
              size={32}
              style={{ color: "oklch(0.62 0.24 27)", margin: "0 auto" }}
              aria-hidden
            />
            <p
              className="mt-3 font-pixel"
              style={{
                fontSize: "0.55rem",
                color: "oklch(0.75 0.16 27)",
                letterSpacing: "0.08em",
              }}
            >
              FAILED TO LOAD
            </p>
            <p
              className="mt-2"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.05rem",
                color: "oklch(0.60 0.10 295)",
              }}
            >
              {error instanceof Error
                ? error.message
                : "Could not fetch conversation."}
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div
            data-ocid="messages.chat.empty_conversation"
            className="text-center py-16 px-6"
          >
            <div
              className="mx-auto mb-5 flex items-center justify-center"
              style={{ width: "56px", height: "56px" }}
            >
              <MessageSquare
                size={44}
                style={{ color: "oklch(0.45 0.16 295)" }}
                aria-hidden
              />
            </div>
            <h3
              className="font-pixel"
              style={{
                fontSize: "0.6rem",
                color: "oklch(0.80 0.12 295)",
                letterSpacing: "0.08em",
              }}
            >
              NO MESSAGES YET
            </h3>
            <p
              className="mt-3"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.15rem",
                color: "oklch(0.55 0.10 295)",
              }}
            >
              Say hello to {peer.username} — type a message below to start the
              conversation.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id.toString()}
                message={msg}
                isOwn={msg.senderUsername === currentUsername}
                senderRole={
                  msg.senderUsername === peer.username ? peer.role : null
                }
                senderRank={
                  msg.senderUsername === peer.username ? peer.rank : null
                }
                index={i}
                currentUsername={currentUsername}
              />
            ))}
          </>
        )}
      </div>

      {/* Message input bar */}
      <div
        className="flex items-end gap-2 px-3 py-3 border-t-2"
        style={{
          background: "oklch(0.14 0.06 295)",
          borderColor: "oklch(0.32 0.14 295)",
        }}
      >
        {isSelfPeer ? (
          <div
            data-ocid="messages.self_peer_hint"
            className="flex-1 flex items-center gap-2 px-3 py-3"
            style={{
              background: "oklch(0.16 0.08 295)",
              border: "2px solid oklch(0.45 0.18 295)",
              fontFamily: '"VT323", monospace',
              fontSize: "1.05rem",
              color: "oklch(0.75 0.14 295)",
              letterSpacing: "0.03em",
            }}
          >
            <ShieldAlert
              size={16}
              style={{ color: "oklch(0.62 0.22 295)" }}
              aria-hidden
            />
            You can't send a message to yourself. Pick a different staff member
            from the sidebar.
          </div>
        ) : (
          <textarea
            data-ocid="messages.input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${peer.username}...`}
            rows={1}
            disabled={sending}
            aria-label={`Message ${peer.username}`}
            className="apply-input flex-1 resize-none"
            style={{
              minHeight: "44px",
              maxHeight: "140px",
              opacity: sending ? 0.6 : 1,
            }}
          />
        )}
        <button
          type="button"
          data-ocid="messages.send_button"
          onClick={handleSend}
          disabled={sending || !draft.trim() || isSelfPeer}
          aria-label="Send message"
          className="minecraft-btn flex items-center gap-2 px-4 py-3 flex-shrink-0"
          style={{
            background: "oklch(0.55 0.25 295)",
            color: "oklch(0.99 0 0)",
            boxShadow:
              "0 3px 0 oklch(0.30 0.15 295), inset 0 1px 0 oklch(0.70 0.22 295)",
            fontSize: "0.5rem",
            letterSpacing: "0.08em",
            border: "2px solid oklch(0.40 0.18 295)",
            cursor:
              sending || !draft.trim() || isSelfPeer
                ? "not-allowed"
                : "pointer",
            opacity: sending || !draft.trim() || isSelfPeer ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (sending || !draft.trim() || isSelfPeer) return;
            (e.currentTarget as HTMLElement).style.background =
              "oklch(0.62 0.25 295)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "oklch(0.55 0.25 295)";
          }}
        >
          {sending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Send size={12} />
          )}
          SEND
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Messages page                                                     */
/* ------------------------------------------------------------------ */

export default function Messages() {
  const { username, role, isAuthenticated, refreshRole } = useAuth();
  const [activePeer, setActivePeer] = useState<string | null>(null);
  // Tracks whether the backend role has been refreshed on mount. Until it
  // resolves we cannot trust the (possibly stale) login-time role for access
  // gating — a newly promoted staff member would otherwise flash AccessDenied.
  const [roleChecked, setRoleChecked] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: username intentionally re-runs refreshRole on login
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshRole();
      if (!cancelled) setRoleChecked(true);
    })();
    return () => {
      cancelled = true;
    };
    // refreshRole is stable per AuthContext; username drives re-fetch on login.
  }, [username, refreshRole]);

  const hasAccess = isStaffRole(role);

  const directory = useStaffDirectory(username);
  // Defense in depth: never request a self-conversation. The backend
  // already returns [] when requester === peer, but skipping the query
  // entirely avoids a wasted round-trip and guarantees no self-thread can
  // ever be rendered even if activePeer is somehow set to the current
  // user (e.g. stale state from a prior session or direct URL seeding).
  const safePeer =
    activePeer !== null && activePeer === username ? null : activePeer;
  const conversation = useStaffConversation(username, safePeer);
  const sendMutation = useSendStaffMessage();

  // Resolve the active peer entry from the directory. Because the directory
  // excludes the current user (server-side + client-side filter), looking
  // up the current username here always yields null — so any attempt to
  // open a self-conversation falls through to the "SELECT A STAFF MEMBER"
  // empty state rather than rendering a self-thread.
  const peerEntry = useMemo(() => {
    if (!safePeer) return null;
    return directory.data?.find((e) => e.username === safePeer) ?? null;
  }, [safePeer, directory.data]);

  const handleSend = (content: string) => {
    if (!username || !activePeer) return;
    // Defense in depth: never send to self. The ChatPanel already
    // disables the composer when isSelfPeer, but a programmatic caller
    // could still reach this handler — block it here too.
    if (activePeer === username) return;
    sendMutation.mutate({
      senderUsername: username,
      recipientUsername: activePeer,
      content,
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.10 0.04 295)" }}
    >
      <Navbar />
      <main className="pt-16 flex-1 flex flex-col">
        {!roleChecked ? (
          <div
            data-ocid="messages.role.loading_state"
            className="flex-1 flex items-center justify-center"
            style={{ background: "oklch(0.10 0.04 295)" }}
          >
            <div
              className="flex items-center gap-3"
              style={{
                fontFamily: '"VT323", monospace',
                color: "oklch(0.65 0.10 295)",
                fontSize: "1.2rem",
                letterSpacing: "0.04em",
              }}
            >
              <Loader2
                size={18}
                className="animate-spin"
                style={{ color: "oklch(0.62 0.22 295)" }}
              />
              VERIFYING STAFF ACCESS...
            </div>
          </div>
        ) : !hasAccess ? (
          <AccessDenied authenticated={isAuthenticated} />
        ) : (
          <FadeSection delay={200}>
            <section
              className="relative overflow-hidden flex-1 flex flex-col"
              style={{
                background: "oklch(0.13 0.08 295)",
                borderBottom: "2px solid oklch(0.32 0.18 295)",
              }}
            >
              <div className="absolute inset-0 block-texture opacity-10 pointer-events-none" />
              <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
                {/* Title */}
                <div className="text-center mb-6">
                  <div
                    className="inline-flex items-center gap-2 mb-3"
                    style={{
                      padding: "0.3rem 0.75rem",
                      background: "oklch(0.18 0.08 295)",
                      border: "1px solid oklch(0.45 0.18 295)",
                    }}
                  >
                    <MessageSquare
                      size={12}
                      style={{ color: "oklch(0.7 0.22 295)" }}
                    />
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: "0.45rem",
                        color: "oklch(0.7 0.22 295)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      STAFF ONLY
                    </span>
                  </div>
                  <h2
                    className="font-pixel"
                    style={{
                      fontSize: "0.9rem",
                      color: "oklch(0.97 0.01 295)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    STAFF MESSAGES
                  </h2>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1.2rem",
                      color: "oklch(0.65 0.10 295)",
                    }}
                  >
                    Private 1:1 direct messaging between staff members.
                  </p>
                </div>

                {/* Two-column chat layout */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] md:grid-rows-[minmax(0,1fr)] gap-4 h-[70vh] overflow-hidden">
                  {/* Sidebar */}
                  <aside
                    className="md:h-full min-h-[200px] md:min-h-0"
                    style={{
                      background: "oklch(0.10 0.04 295)",
                      border: "2px solid oklch(0.30 0.10 295)",
                      boxShadow: "4px 4px 0px oklch(0.08 0.04 295)",
                    }}
                  >
                    <StaffList
                      entries={directory.data ?? []}
                      currentUsername={username ?? ""}
                      activePeer={activePeer}
                      onSelect={setActivePeer}
                      isLoading={directory.isLoading}
                      isError={directory.isError}
                    />
                  </aside>

                  {/* Chat area */}
                  <section className="md:h-full min-h-0 overflow-hidden">
                    <ChatPanel
                      peer={peerEntry}
                      currentUsername={username ?? ""}
                      messages={conversation.data ?? []}
                      isLoading={conversation.isLoading}
                      isError={conversation.isError}
                      error={conversation.error}
                      onSend={handleSend}
                      sending={sendMutation.isPending}
                    />
                  </section>
                </div>
              </div>
            </section>
          </FadeSection>
        )}
      </main>
      <Footer />
    </div>
  );
}
