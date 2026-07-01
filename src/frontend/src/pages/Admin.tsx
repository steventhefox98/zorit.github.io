import { ApplicationStatus, AppliedRole, Role, RosterRank } from "@/backend";
import type { UserEntry } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAcceptApplication,
  useDeclineApplication,
  useGetAllApplications,
  useGetAllUsers,
  useSetRole,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Eye,
  Loader2,
  Search,
  Shield,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { RANKS } from "../components/layout/RoleHierarchySection";
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

const APPLIED_ROLE_BADGE: Record<AppliedRole, string> = {
  [AppliedRole.Mod]: "role-badge role-coadmin",
  [AppliedRole.Admin]: "role-badge role-admin",
  [AppliedRole.Builder]: "role-badge role-member",
  [AppliedRole.Developer]: "role-badge role-coadmin",
};

const APPLIED_ROLE_LABEL: Record<AppliedRole, string> = {
  [AppliedRole.Mod]: "MOD",
  [AppliedRole.Admin]: "ADMIN",
  [AppliedRole.Builder]: "BUILDER",
  [AppliedRole.Developer]: "DEVELOPER",
};

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: "status-badge status-pending",
  [ApplicationStatus.Accepted]: "status-badge status-accepted",
  [ApplicationStatus.Declined]: "status-badge status-declined",
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: "PENDING",
  [ApplicationStatus.Accepted]: "ACCEPTED",
  [ApplicationStatus.Declined]: "DECLINED",
};

/* ------------------------------------------------------------------ */
/*  Role display maps (mirror Navbar.tsx — kept in sync manually)      */
/* ------------------------------------------------------------------ */

const ROLE_BADGE_CLASS: Record<Role, string> = {
  [Role.Administrator]: "role-badge role-admin",
  [Role.CoAdministrator]: "role-badge role-coadmin",
  [Role.Member]: "role-badge role-member",
  [Role.Owner]: "role-badge role-admin",
  [Role.CoOwner]: "role-badge role-coadmin",
  [Role.Manager]: "role-badge role-coadmin",
  [Role.AdvertiseManager]: "role-badge role-coadmin",
  [Role.ChiefAdmin]: "role-badge role-admin",
  [Role.SrDeveloper]: "role-badge role-coadmin",
  [Role.Developer]: "role-badge role-coadmin",
  [Role.Admin]: "role-badge role-admin",
  [Role.JrAdmin]: "role-badge role-coadmin",
  [Role.Mod]: "role-badge role-member",
  [Role.Cop]: "role-badge role-member",
  [Role.Builder]: "role-badge role-member",
  [Role.SrCop]: "role-badge role-coadmin",
};

const ROLE_LABEL: Record<Role, string> = {
  [Role.Administrator]: "ADMIN",
  [Role.CoAdministrator]: "CO-ADMIN",
  [Role.Member]: "MEMBER",
  [Role.Owner]: "OWNER",
  [Role.CoOwner]: "CO-OWNER",
  [Role.Manager]: "MANAGER",
  [Role.AdvertiseManager]: "AD-MANAGER",
  [Role.ChiefAdmin]: "CHIEF-ADMIN",
  [Role.SrDeveloper]: "SR-DEV",
  [Role.Developer]: "DEV",
  [Role.Admin]: "ADMIN",
  [Role.JrAdmin]: "JR-ADMIN",
  [Role.Mod]: "MOD",
  [Role.Cop]: "COP",
  [Role.Builder]: "BUILDER",
  [Role.SrCop]: "SR-COP",
};

/* The full 16-Role selector list for the Users dropdown. Built from the
   canonical RANKS array (13 roster ranks) plus the 3 access tiers, so
   there is no second hardcoded rank list to drift out of sync. The 13
   roster ranks share string values with their Role counterparts, so we
   cast through unknown to map RosterRank -> Role safely. */
const ROLE_OPTIONS: { value: Role; label: string; group: string }[] = [
  { value: Role.Administrator, label: "Administrator", group: "Access Tier" },
  {
    value: Role.CoAdministrator,
    label: "Co-Administrator",
    group: "Access Tier",
  },
  { value: Role.Member, label: "Member", group: "Access Tier" },
  ...RANKS.map((r) => ({
    value: r.rank as unknown as Role,
    label: r.label,
    group: "Staff Rank",
  })),
];

/* All 14 RosterRank variants with friendly labels, in the order admins
   typically scan them (leadership first). Used by the two-step accept
   rank picker. */
const RANK_OPTIONS: { value: RosterRank; label: string }[] = [
  { value: RosterRank.Owner, label: "Owner" },
  { value: RosterRank.CoOwner, label: "Co-Owner" },
  { value: RosterRank.Manager, label: "Manager" },
  { value: RosterRank.AdvertiseManager, label: "Advertise Manager" },
  { value: RosterRank.ChiefAdmin, label: "Chief Admin" },
  { value: RosterRank.SrDeveloper, label: "SR. Developer" },
  { value: RosterRank.Developer, label: "Developer" },
  { value: RosterRank.Admin, label: "Admin" },
  { value: RosterRank.JrAdmin, label: "JR. Admin" },
  { value: RosterRank.Mod, label: "Mod" },
  { value: RosterRank.Cop, label: "Cop" },
  { value: RosterRank.Builder, label: "Builder" },
  { value: RosterRank.SrCop, label: "Sr-Cop" },
];

/* Ranks that grant full Administrator access (top tier). Every other
   RosterRank grants Co-Administrator access. This mirrors the backend
   rankToAccessRole mapping in staff-roster-and-applications.mo — keep
   them in sync. */
const ADMIN_TIER_RANKS: ReadonlySet<RosterRank> = new Set([
  RosterRank.Owner,
  RosterRank.CoOwner,
  RosterRank.Manager,
  RosterRank.ChiefAdmin,
  RosterRank.SrCop,
  RosterRank.Cop,
]);

function rankAccessTier(rank: RosterRank): {
  label: string;
  isAdmin: boolean;
} {
  const isAdmin = ADMIN_TIER_RANKS.has(rank);
  return {
    label: isAdmin ? "Administrator" : "Co-Administrator",
    isAdmin,
  };
}

/* The 12 application questions per role, in submission order. The backend
   stores answers as a string[] whose indices line up with the question list
   for the role the applicant applied for. These must stay in sync with the
   per-role question arrays on the Apply page (Apply.tsx). */
const APPLICATION_QUESTIONS: Record<AppliedRole, string[]> = {
  [AppliedRole.Mod]: [
    "Full Name",
    "Minecraft Username",
    "Discord Username (with #tag)",
    "Age",
    "Timezone",
    "How long have you been playing on ZoritLegends?",
    "Do you have any previous experience as a Moderator, Support staff, or similar role? If yes, please describe.",
    "What skills or qualities do you possess that make you a good fit for the Moderator/Support role? (e.g., communication, patience, problem-solving)",
    "How would you handle a situation where a player is repeatedly breaking minor rules (e.g., spamming, mild disrespect)?",
    "If a player asks you for help with an in-game issue, but you're busy with other tasks, how would you handle the situation?",
    "How would you handle a situation where a player is upset about being warned or punished, and they're becoming aggressive towards staff?",
    "How much time can you commit to moderating ZoritLegends each week, and are you available during peak hours?",
  ],
  [AppliedRole.Admin]: [
    "Full Name",
    "Minecraft Username",
    "Discord Username (with #tag)",
    "Age",
    "Timezone",
    "How long have you been playing on ZoritLegends?",
    "Do you have any previous experience as a server admin or in a similar role? If yes, please describe.",
    "What skills or knowledge make you a good fit for the admin role? (e.g., moderation, event management, troubleshooting)",
    "How would you handle a player who is breaking server rules but is insisting they did nothing wrong?",
    "What would you do if there's an argument between staff members that's affecting the team's performance?",
    "How would you handle a situation where a player is harassing another player, and both parties are involved in the conflict?",
    "How much time can you commit to managing ZoritLegends each week, and are you available during peak hours?",
  ],
  [AppliedRole.Builder]: [
    "Full Name",
    "Minecraft Username",
    "Discord Username (with #tag)",
    "Age",
    "Timezone",
    "How long have you been playing on ZoritLegends?",
    "Do you have any previous experience as a server builder or in a similar role? If yes, please describe your experience.",
    "What building tools, mods, or plugins do you commonly use to create structures or environments?",
    "Can you provide examples of previous builds or projects you've worked on (either in ZoritLegends or other servers)?",
    "How comfortable are you with large-scale builds and working with server staff to create themed areas, spawn points, or events?",
    "Describe your building style. How would you approach building a new spawn or town on ZoritLegends?",
    "If given a creative direction for a build (e.g., a medieval village or futuristic city), how do you typically approach the project, from planning to execution?",
  ],
  [AppliedRole.Developer]: [
    "Full Name",
    "Minecraft Username",
    "Discord Username (with #tag)",
    "Age",
    "TimeZone",
    "How long have you been playing on ZoritLegends?",
    "What programming languages are you proficient in (Java, Python, etc.)?",
    "Do you have any previous experience in Minecraft server development? If yes, please describe your experience.",
    "Do you have experience with Minecraft server plugins (e.g., Spigot, Bukkit, Paper)? If yes, can you list some you've developed or worked on?",
    "How comfortable are you with troubleshooting and debugging server issues or code problems?",
    "If given a task to implement a new feature or fix a bug, how would you approach it?",
    "What would you do if your development work caused an issue on the server during peak hours?",
  ],
};

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function isAdminRole(role: Role | null): boolean {
  return role === Role.Administrator || role === Role.CoAdministrator;
}

function canReview(role: Role | null): boolean {
  return role === Role.Administrator;
}

function formatTimestamp(ns: bigint): string {
  // IC timestamps are nanoseconds since epoch.
  const ms = Number(ns / 1_000_000n);
  if (!Number.isFinite(ms) || ms <= 0) return "Unknown";
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
            ? "You don't have permission to view this panel. Only Administrators and Co-Administrators can review applications."
            : "You must be signed in as an Administrator or Co-Administrator to access this panel."}
        </p>
        <button
          type="button"
          data-ocid="admin.back_home_button"
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
/*  Empty state                                                       */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div
      data-ocid="admin.empty_state"
      className="relative overflow-hidden text-center py-20"
      style={{
        background: "oklch(0.12 0.06 295)",
        border: "2px solid oklch(0.30 0.10 295)",
        boxShadow: "4px 4px 0px oklch(0.08 0.04 295)",
      }}
    >
      <div className="absolute inset-0 block-texture opacity-10" />
      <div className="relative z-10">
        <Clock
          size={48}
          style={{ color: "oklch(0.55 0.18 295)", margin: "0 auto" }}
          aria-hidden
        />
        <h3
          className="font-pixel mt-6"
          style={{
            fontSize: "0.7rem",
            color: "oklch(0.85 0.12 295)",
            letterSpacing: "0.08em",
          }}
        >
          NO APPLICATIONS YET
        </h3>
        <p
          className="mt-3"
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: "1.15rem",
            color: "oklch(0.55 0.10 295)",
          }}
        >
          Submitted applications will appear here for review.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading state                                                     */
/* ------------------------------------------------------------------ */

function LoadingState() {
  return (
    <div
      data-ocid="admin.loading_state"
      className="text-center py-20"
      style={{
        background: "oklch(0.12 0.06 295)",
        border: "2px solid oklch(0.30 0.10 295)",
        boxShadow: "4px 4px 0px oklch(0.08 0.04 295)",
      }}
    >
      <Loader2
        size={36}
        className="animate-spin"
        style={{ color: "oklch(0.62 0.22 295)", margin: "0 auto" }}
        aria-hidden
      />
      <p
        className="mt-4 font-pixel"
        style={{
          fontSize: "0.55rem",
          color: "oklch(0.65 0.10 295)",
          letterSpacing: "0.08em",
        }}
      >
        LOADING APPLICATIONS...
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error state                                                       */
/* ------------------------------------------------------------------ */

function ErrorState({ message }: { message: string }) {
  return (
    <div
      data-ocid="admin.error_state"
      className="text-center py-16 px-6"
      style={{
        background: "oklch(0.14 0.06 295)",
        border: "2px solid oklch(0.50 0.18 27)",
        boxShadow: "4px 4px 0px oklch(0.08 0.04 295)",
      }}
    >
      <AlertTriangle
        size={40}
        style={{ color: "oklch(0.62 0.24 27)", margin: "0 auto" }}
        aria-hidden
      />
      <h3
        className="font-pixel mt-4"
        style={{
          fontSize: "0.6rem",
          color: "oklch(0.75 0.16 27)",
          letterSpacing: "0.08em",
        }}
      >
        FAILED TO LOAD
      </h3>
      <p
        className="mt-3"
        style={{
          fontFamily: '"VT323", monospace',
          fontSize: "1.1rem",
          color: "oklch(0.60 0.10 295)",
        }}
      >
        {message}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Two-step accept modal                                              */
/* ------------------------------------------------------------------ */

interface AcceptModalProps {
  application: {
    id: bigint;
    applicantUsername: string;
    appliedRole: AppliedRole;
  };
  callerUsername: string;
  confirming: boolean;
  onConfirm: (assignedRank: RosterRank) => void;
  onClose: () => void;
}

function AcceptModal({
  application,
  callerUsername,
  confirming,
  onConfirm,
  onClose,
}: AcceptModalProps) {
  // Default to a sensible staff rank matching the applied role when possible.
  const defaultRank =
    application.appliedRole === AppliedRole.Admin
      ? RosterRank.Admin
      : application.appliedRole === AppliedRole.Builder
        ? RosterRank.Builder
        : application.appliedRole === AppliedRole.Developer
          ? RosterRank.Developer
          : RosterRank.Mod;
  const [selectedRank, setSelectedRank] = useState<RosterRank>(defaultRank);

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirming) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [confirming, onClose]);

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="accept-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.05 0.04 295 / 0.85)" }}
        onClick={() => {
          if (!confirming) onClose();
        }}
        onKeyDown={() => {}}
      />

      {/* Modal panel — pixel-bordered, VT323, purple aesthetic */}
      <div
        data-ocid="admin.accept.dialog"
        className="relative w-full max-w-md"
        style={{
          background: "oklch(0.14 0.08 295)",
          border: "3px solid oklch(0.55 0.22 295)",
          boxShadow:
            "6px 6px 0px oklch(0.08 0.04 295), inset 0 1px 0 oklch(0.40 0.18 295)",
        }}
      >
        <div className="absolute inset-0 block-texture opacity-10 pointer-events-none" />

        {/* Header */}
        <div
          className="relative z-10 flex items-center justify-between px-5 py-3"
          style={{
            borderBottom: "2px solid oklch(0.40 0.18 295)",
            background: "oklch(0.18 0.10 295)",
          }}
        >
          <div className="flex items-center gap-2">
            <Shield
              size={14}
              style={{ color: "oklch(0.7 0.22 295)" }}
              aria-hidden
            />
            <h3
              id="accept-modal-title"
              className="font-pixel"
              style={{
                fontSize: "0.6rem",
                color: "oklch(0.97 0.01 295)",
                letterSpacing: "0.08em",
              }}
            >
              ACCEPT APPLICATION
            </h3>
          </div>
          <button
            type="button"
            data-ocid="admin.accept.close_button"
            onClick={() => {
              if (!confirming) onClose();
            }}
            disabled={confirming}
            aria-label="Close accept dialog"
            className="flex items-center justify-center transition-colors"
            style={{
              width: "24px",
              height: "24px",
              background: "oklch(0.18 0.08 295)",
              border: "2px solid oklch(0.40 0.18 295)",
              color: "oklch(0.75 0.15 295)",
              cursor: confirming ? "not-allowed" : "pointer",
              opacity: confirming ? 0.5 : 1,
            }}
          >
            <X size={12} />
          </button>
        </div>

        {/* Body */}
        <div className="relative z-10 px-5 py-5">
          <p
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.1rem",
              color: "oklch(0.65 0.10 295)",
              lineHeight: 1.4,
            }}
          >
            Promote{" "}
            <span style={{ color: "oklch(0.85 0.15 295)" }}>
              {application.applicantUsername}
            </span>{" "}
            to a staff role by selecting a rank. The access tier is granted
            automatically based on the rank.
          </p>

          {/* Rank picker */}
          <label
            htmlFor="accept-rank-select"
            className="font-pixel mt-5 block"
            style={{
              fontSize: "0.5rem",
              color: "oklch(0.7 0.18 295)",
              letterSpacing: "0.08em",
            }}
          >
            RANK
          </label>
          <div className="relative mt-2">
            <select
              id="accept-rank-select"
              data-ocid="admin.accept.rank_select"
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value as RosterRank)}
              disabled={confirming}
              className="apply-input w-full appearance-none pr-10"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.15rem",
                color: "oklch(0.92 0.05 295)",
                background: "oklch(0.10 0.05 295)",
                border: "2px solid oklch(0.40 0.18 295)",
                boxShadow: "inset 2px 2px 0 oklch(0.05 0.03 295)",
                padding: "0.5rem 0.75rem",
                cursor: confirming ? "not-allowed" : "pointer",
                opacity: confirming ? 0.6 : 1,
              }}
            >
              {RANK_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1.05rem",
                    background: "oklch(0.14 0.08 295)",
                    color: "oklch(0.92 0.05 295)",
                  }}
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute"
              style={{
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "oklch(0.65 0.15 295)",
              }}
              aria-hidden
            />
          </div>

          {/* Auto-derived access tier badge — reflects backend rankToAccessRole */}
          {(() => {
            const tier = rankAccessTier(selectedRank);
            return (
              <div
                data-ocid="admin.accept.access_tier_badge"
                className="mt-3 flex items-center gap-2"
                style={{
                  padding: "0.4rem 0.6rem",
                  background: tier.isAdmin
                    ? "oklch(0.20 0.10 295 / 0.5)"
                    : "oklch(0.18 0.06 295 / 0.5)",
                  border: `2px solid ${
                    tier.isAdmin
                      ? "oklch(0.55 0.22 295)"
                      : "oklch(0.40 0.14 295)"
                  }`,
                }}
              >
                <Shield
                  size={12}
                  style={{
                    color: tier.isAdmin
                      ? "oklch(0.7 0.22 295)"
                      : "oklch(0.62 0.16 295)",
                  }}
                  aria-hidden
                />
                <span
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "0.95rem",
                    color: "oklch(0.78 0.12 295)",
                    letterSpacing: "0.03em",
                  }}
                >
                  Grants{" "}
                  <span
                    style={{
                      color: tier.isAdmin
                        ? "oklch(0.78 0.20 295)"
                        : "oklch(0.70 0.14 295)",
                      fontWeight: 700,
                    }}
                  >
                    {tier.label}
                  </span>{" "}
                  access
                </span>
              </div>
            );
          })()}

          {/* Acting-as hint */}
          <p
            className="mt-3"
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "0.95rem",
              color: "oklch(0.50 0.10 295)",
              letterSpacing: "0.03em",
            }}
          >
            Acting as:{" "}
            <span style={{ color: "oklch(0.62 0.18 295)" }}>
              {callerUsername || "—"}
            </span>
          </p>
        </div>

        {/* Footer actions */}
        <div
          className="relative z-10 flex items-center justify-end gap-3 px-5 py-4"
          style={{ borderTop: "2px solid oklch(0.30 0.10 295)" }}
        >
          <button
            type="button"
            data-ocid="admin.accept.cancel_button"
            onClick={() => {
              if (!confirming) onClose();
            }}
            disabled={confirming}
            className="minecraft-btn flex items-center gap-2 px-4 py-2"
            style={{
              background: "oklch(0.20 0.06 295)",
              color: "oklch(0.85 0.10 295)",
              boxShadow:
                "0 3px 0 oklch(0.12 0.04 295), inset 0 1px 0 oklch(0.30 0.10 295)",
              fontSize: "0.5rem",
              letterSpacing: "0.08em",
              border: "2px solid oklch(0.35 0.12 295)",
              cursor: confirming ? "not-allowed" : "pointer",
              opacity: confirming ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (confirming) return;
              (e.currentTarget as HTMLElement).style.background =
                "oklch(0.26 0.08 295)";
            }}
            onMouseLeave={(e) => {
              if (confirming) return;
              (e.currentTarget as HTMLElement).style.background =
                "oklch(0.20 0.06 295)";
            }}
          >
            CANCEL
          </button>
          <button
            type="button"
            data-ocid="admin.accept.confirm_button"
            onClick={() => onConfirm(selectedRank)}
            disabled={confirming}
            className="minecraft-btn flex items-center gap-2 px-5 py-2"
            style={{
              background: "oklch(0.55 0.18 145)",
              color: "oklch(0.99 0 0)",
              boxShadow:
                "0 3px 0 oklch(0.30 0.12 145), inset 0 1px 0 oklch(0.70 0.20 145)",
              fontSize: "0.5rem",
              letterSpacing: "0.08em",
              border: "2px solid oklch(0.40 0.16 145)",
              cursor: confirming ? "not-allowed" : "pointer",
              opacity: confirming ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (confirming) return;
              (e.currentTarget as HTMLElement).style.background =
                "oklch(0.62 0.20 145)";
            }}
            onMouseLeave={(e) => {
              if (confirming) return;
              (e.currentTarget as HTMLElement).style.background =
                "oklch(0.55 0.18 145)";
            }}
          >
            {confirming ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            CONFIRM & PROMOTE
          </button>
        </div>
      </div>
    </dialog>
  );
}

interface ApplicationCardProps {
  index: number;
  application: {
    id: bigint;
    applicantUsername: string;
    appliedRole: AppliedRole;
    answers: string[];
    timestamp: bigint;
    status: ApplicationStatus;
  };
  canReviewApps: boolean;
  onAccept: (id: bigint) => void;
  onDecline: (id: bigint) => void;
  accepting: boolean;
  acceptingId: bigint | null;
  declining: boolean;
  decliningId: bigint | null;
}

function ApplicationCard({
  index,
  application,
  canReviewApps,
  onAccept,
  onDecline,
  accepting,
  acceptingId,
  declining,
  decliningId,
}: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isPending = application.status === ApplicationStatus.Pending;
  const isAcceptingThis = accepting && acceptingId === application.id;
  const isDecliningThis = declining && decliningId === application.id;
  const isBusy = isAcceptingThis || isDecliningThis;

  return (
    <div
      data-ocid={`admin.item.${index + 1}`}
      className={`apply-card${expanded ? " is-expanded" : ""}`}
    >
      <div className="absolute inset-0 block-texture opacity-10 pointer-events-none" />

      {/* Header row */}
      <div className="relative z-10 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-pixel"
                style={{
                  fontSize: "0.5rem",
                  color: "oklch(0.45 0.18 295)",
                  letterSpacing: "0.05em",
                }}
              >
                #{String(index + 1).padStart(2, "0")}
              </span>
              <h3
                className="font-pixel truncate"
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.97 0.01 295)",
                  letterSpacing: "0.04em",
                }}
              >
                {application.applicantUsername}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={APPLIED_ROLE_BADGE[application.appliedRole]}>
                {APPLIED_ROLE_LABEL[application.appliedRole]}
              </span>
              <span className={STATUS_BADGE[application.status]}>
                {STATUS_LABEL[application.status]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "0.95rem",
                color: "oklch(0.55 0.10 295)",
                letterSpacing: "0.03em",
              }}
            >
              {formatTimestamp(application.timestamp)}
            </span>
            <button
              type="button"
              data-ocid={`admin.toggle_button.${index + 1}`}
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Collapse answers" : "Expand answers"}
              aria-expanded={expanded}
              className="flex items-center justify-center transition-transform duration-150"
              style={{
                width: "28px",
                height: "28px",
                background: "oklch(0.18 0.08 295)",
                border: "2px solid oklch(0.35 0.14 295)",
                color: "oklch(0.75 0.15 295)",
                cursor: "pointer",
                transform: expanded ? "rotate(180deg)" : "none",
              }}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Expandable answers */}
        {expanded && (
          <div className="mt-4">
            <div
              className="flex items-center gap-2 mb-2"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "0.95rem",
                color: "oklch(0.65 0.12 295)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <Eye size={13} style={{ color: "oklch(0.62 0.22 295)" }} />
              Application Answers
            </div>
            <div className="apply-answers space-y-3">
              {application.answers.map((answer, i) => {
                const roleQuestions =
                  APPLICATION_QUESTIONS[application.appliedRole];
                return (
                  <div key={`q${i}-${answer.slice(0, 12)}`}>
                    <div
                      className="flex items-baseline gap-2"
                      style={{
                        fontFamily: '"VT323", monospace',
                        fontSize: "0.9rem",
                        color: "oklch(0.62 0.22 295)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      <span
                        className="font-pixel"
                        style={{ fontSize: "0.5rem" }}
                      >
                        Q{String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ color: "oklch(0.75 0.12 295)" }}>
                        {roleQuestions[i] ?? `Question ${i + 1}`}
                      </span>
                    </div>
                    <p
                      className="mt-1"
                      style={{
                        fontFamily: '"VT323", monospace',
                        fontSize: "1.05rem",
                        color: "oklch(0.88 0.08 295)",
                        lineHeight: 1.4,
                        paddingLeft: "0.5rem",
                        borderLeft: "2px solid oklch(0.35 0.14 295)",
                      }}
                    >
                      {answer?.trim() ? answer : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons — only for Administrator + Pending applications */}
        {isPending && canReviewApps && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              data-ocid={`admin.accept_button.${index + 1}`}
              onClick={() => onAccept(application.id)}
              disabled={isBusy}
              className="minecraft-btn flex items-center gap-2 px-5 py-2.5"
              style={{
                background: "oklch(0.55 0.18 145)",
                color: "oklch(0.99 0 0)",
                boxShadow:
                  "0 3px 0 oklch(0.30 0.12 145), inset 0 1px 0 oklch(0.70 0.20 145)",
                fontSize: "0.5rem",
                letterSpacing: "0.08em",
                border: "2px solid oklch(0.40 0.16 145)",
                cursor: isBusy ? "not-allowed" : "pointer",
                opacity: isBusy ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (isBusy) return;
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.62 0.20 145)";
              }}
              onMouseLeave={(e) => {
                if (isBusy) return;
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.55 0.18 145)";
              }}
            >
              {isAcceptingThis ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              ACCEPT
            </button>
            <button
              type="button"
              data-ocid={`admin.decline_button.${index + 1}`}
              onClick={() => onDecline(application.id)}
              disabled={isBusy}
              className="minecraft-btn flex items-center gap-2 px-5 py-2.5"
              style={{
                background: "oklch(0.45 0.20 27)",
                color: "oklch(0.99 0 0)",
                boxShadow:
                  "0 3px 0 oklch(0.28 0.14 27), inset 0 1px 0 oklch(0.62 0.22 27)",
                fontSize: "0.5rem",
                letterSpacing: "0.08em",
                border: "2px solid oklch(0.38 0.16 27)",
                cursor: isBusy ? "not-allowed" : "pointer",
                opacity: isBusy ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (isBusy) return;
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.52 0.22 27)";
              }}
              onMouseLeave={(e) => {
                if (isBusy) return;
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.45 0.20 27)";
              }}
            >
              {isDecliningThis ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <X size={12} />
              )}
              DECLINE
            </button>
          </div>
        )}

        {/* Co-Administrator view-only hint on pending apps */}
        {isPending && !canReviewApps && (
          <div
            className="mt-4 flex items-center gap-2"
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "0.95rem",
              color: "oklch(0.55 0.10 295)",
              letterSpacing: "0.04em",
            }}
          >
            <Eye size={12} style={{ color: "oklch(0.55 0.18 295)" }} />
            View only — only Administrators can accept or decline.
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Users dropdown — Administrator-only role management panel          */
/* ------------------------------------------------------------------ */

interface UsersDropdownProps {
  callerUsername: string;
}

function UsersDropdown({ callerUsername }: UsersDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const usersQuery = useGetAllUsers();
  const setRoleMutation = useSetRole();

  // Close on outside-click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const users = usersQuery.data ?? [];
  const filtered = query.trim()
    ? users.filter((u) =>
        u.username.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : users;

  const mutatingTarget = setRoleMutation.variables?.targetUsername ?? null;

  const handleRoleChange = (user: UserEntry, newRole: Role) => {
    if (!callerUsername) return;
    if (user.username === callerUsername) return; // self-edit disabled
    setRoleMutation.mutate({
      callerUsername,
      targetUsername: user.username,
      newRole,
    });
  };

  return (
    <div className="relative inline-block">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        data-ocid="admin.users.open_dropdown_button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="minecraft-btn flex items-center gap-2 px-4 py-2.5"
        style={{
          background: open ? "oklch(0.30 0.14 295)" : "oklch(0.22 0.10 295)",
          color: "oklch(0.97 0.01 295)",
          boxShadow:
            "0 3px 0 oklch(0.12 0.06 295), inset 0 1px 0 oklch(0.40 0.18 295)",
          fontSize: "0.5rem",
          letterSpacing: "0.08em",
          border: "2px solid oklch(0.45 0.18 295)",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!open)
            (e.currentTarget as HTMLElement).style.background =
              "oklch(0.28 0.12 295)";
        }}
        onMouseLeave={(e) => {
          if (!open)
            (e.currentTarget as HTMLElement).style.background =
              "oklch(0.22 0.10 295)";
        }}
      >
        <Users size={12} style={{ color: "oklch(0.75 0.20 295)" }} />
        USERS
        <ChevronDown
          size={12}
          style={{
            color: "oklch(0.70 0.18 295)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={containerRef}
          data-ocid="admin.users.dropdown"
          className="absolute right-0 z-40 mt-2 w-[min(92vw,30rem)]"
          style={{
            background: "oklch(0.12 0.05 295)",
            border: "2px solid oklch(0.28 0.12 295)",
            boxShadow: "6px 6px 0 oklch(0.07 0.03 295)",
          }}
        >
          <div className="absolute inset-0 block-texture opacity-10 pointer-events-none" />

          {/* Panel header */}
          <div
            className="relative z-10 flex items-center justify-between px-4 py-2"
            style={{
              background: "oklch(0.18 0.10 295)",
              borderBottom: "2px solid oklch(0.28 0.12 295)",
            }}
          >
            <div className="flex items-center gap-2">
              <Users size={12} style={{ color: "oklch(0.75 0.20 295)" }} />
              <span
                className="font-pixel"
                style={{
                  fontSize: "0.55rem",
                  color: "oklch(0.85 0.15 295)",
                  letterSpacing: "0.1em",
                }}
              >
                MANAGE USERS
              </span>
            </div>
            <button
              type="button"
              data-ocid="admin.users.close_button"
              onClick={() => setOpen(false)}
              aria-label="Close users dropdown"
              className="flex items-center justify-center transition-colors"
              style={{
                width: "22px",
                height: "22px",
                background: "oklch(0.18 0.08 295)",
                border: "2px solid oklch(0.40 0.18 295)",
                color: "oklch(0.75 0.15 295)",
                cursor: "pointer",
              }}
            >
              <X size={11} />
            </button>
          </div>

          {/* Search input */}
          <div
            className="relative z-10 px-3 py-3"
            style={{ borderBottom: "1px solid oklch(0.22 0.08 295)" }}
          >
            <div className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute"
                style={{
                  left: "0.6rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "oklch(0.55 0.14 295)",
                }}
                aria-hidden
              />
              <input
                type="text"
                data-ocid="admin.users.search_input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by username..."
                aria-label="Filter users by username"
                className="w-full"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.05rem",
                  color: "oklch(0.92 0.06 295)",
                  background: "oklch(0.10 0.04 295)",
                  border: "2px solid oklch(0.38 0.18 295)",
                  boxShadow: "inset 2px 2px 0 oklch(0.05 0.03 295)",
                  padding: "0.4rem 0.6rem 0.4rem 1.9rem",
                  outline: "none",
                  letterSpacing: "0.02em",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "oklch(0.68 0.20 295)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "oklch(0.38 0.18 295)";
                }}
              />
            </div>
          </div>

          {/* User list (scrollable) */}
          <div
            className="relative z-10 overflow-y-auto"
            style={{ maxHeight: "22rem" }}
          >
            {usersQuery.isLoading ? (
              <div
                data-ocid="admin.users.loading_state"
                className="flex items-center justify-center gap-2 py-8"
              >
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ color: "oklch(0.62 0.22 295)" }}
                />
                <span
                  className="font-pixel"
                  style={{
                    fontSize: "0.5rem",
                    color: "oklch(0.65 0.10 295)",
                    letterSpacing: "0.08em",
                  }}
                >
                  LOADING USERS...
                </span>
              </div>
            ) : usersQuery.isError ? (
              <div
                data-ocid="admin.users.error_state"
                className="px-4 py-6 text-center"
              >
                <AlertTriangle
                  size={20}
                  style={{
                    color: "oklch(0.62 0.24 27)",
                    margin: "0 auto",
                  }}
                />
                <p
                  className="mt-2"
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1rem",
                    color: "oklch(0.60 0.10 295)",
                  }}
                >
                  Failed to load users.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div
                data-ocid="admin.users.empty_state"
                className="px-4 py-8 text-center"
              >
                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1.1rem",
                    color: "oklch(0.55 0.10 295)",
                  }}
                >
                  {query.trim()
                    ? "No users match your filter."
                    : "No users found."}
                </p>
              </div>
            ) : (
              <ul className="py-1">
                {filtered.map((user, i) => {
                  const isSelf = user.username === callerUsername;
                  const isMutating = mutatingTarget === user.username;
                  return (
                    <li
                      key={user.username}
                      data-ocid={`admin.users.item.${i + 1}`}
                      className="flex items-center gap-3 px-3 py-2.5"
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? "1px solid oklch(0.18 0.06 295)"
                            : "none",
                        opacity: isMutating ? 0.6 : 1,
                        transition: "opacity 0.15s",
                      }}
                    >
                      <span
                        aria-hidden
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "oklch(0.18 0.10 295)",
                          border: "2px solid oklch(0.45 0.18 295)",
                          boxShadow: "inset 1px 1px 0 oklch(0.10 0.05 295)",
                          fontFamily: '"VT323", monospace',
                          fontSize: "1.1rem",
                          color: "oklch(0.85 0.15 295)",
                          letterSpacing: "0.02em",
                          textTransform: "uppercase",
                        }}
                      >
                        {(user.username || "?").slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-pixel truncate"
                            style={{
                              fontSize: "0.55rem",
                              color: "oklch(0.92 0.05 295)",
                              letterSpacing: "0.04em",
                              maxWidth: "8rem",
                            }}
                          >
                            {user.username}
                          </span>
                          <span className={ROLE_BADGE_CLASS[user.role]}>
                            {ROLE_LABEL[user.role]}
                          </span>
                          {isSelf && (
                            <span
                              style={{
                                fontFamily: '"VT323", monospace',
                                fontSize: "0.8rem",
                                color: "oklch(0.62 0.18 145)",
                                letterSpacing: "0.04em",
                              }}
                            >
                              (you)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isMutating && (
                          <Loader2
                            size={12}
                            className="animate-spin"
                            style={{ color: "oklch(0.62 0.22 295)" }}
                          />
                        )}
                        <select
                          data-ocid={`admin.users.role_select.${i + 1}`}
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user, e.target.value as Role)
                          }
                          disabled={isSelf || isMutating}
                          aria-label={`Change role for ${user.username}`}
                          className="appearance-none pr-6"
                          style={{
                            fontFamily: '"VT323", monospace',
                            fontSize: "0.95rem",
                            color: isSelf
                              ? "oklch(0.50 0.08 295)"
                              : "oklch(0.92 0.06 295)",
                            background: "oklch(0.10 0.05 295)",
                            border: "2px solid oklch(0.40 0.18 295)",
                            boxShadow: "inset 2px 2px 0 oklch(0.05 0.03 295)",
                            padding: "0.3rem 0.5rem",
                            cursor: isSelf ? "not-allowed" : "pointer",
                            opacity: isSelf ? 0.6 : 1,
                            outline: "none",
                          }}
                        >
                          <optgroup label="Access Tier">
                            {ROLE_OPTIONS.filter(
                              (o) => o.group === "Access Tier",
                            ).map((o) => (
                              <option
                                key={o.value}
                                value={o.value}
                                style={{
                                  fontFamily: '"VT323", monospace',
                                  fontSize: "0.95rem",
                                  background: "oklch(0.14 0.08 295)",
                                  color: "oklch(0.92 0.05 295)",
                                }}
                              >
                                {o.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Staff Rank">
                            {ROLE_OPTIONS.filter(
                              (o) => o.group === "Staff Rank",
                            ).map((o) => (
                              <option
                                key={o.value}
                                value={o.value}
                                style={{
                                  fontFamily: '"VT323", monospace',
                                  fontSize: "0.95rem",
                                  background: "oklch(0.14 0.08 295)",
                                  color: "oklch(0.92 0.05 295)",
                                }}
                              >
                                {o.label}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        <ChevronDown
                          size={12}
                          className="pointer-events-none"
                          style={{
                            marginLeft: "-1.4rem",
                            color: isSelf
                              ? "oklch(0.45 0.08 295)"
                              : "oklch(0.65 0.15 295)",
                          }}
                          aria-hidden
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Panel footer */}
          <div
            className="relative z-10 px-4 py-2 flex items-center justify-between"
            style={{
              borderTop: "2px solid oklch(0.22 0.08 295)",
              background: "oklch(0.11 0.05 295)",
            }}
          >
            <span
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "0.9rem",
                color: "oklch(0.50 0.10 295)",
                letterSpacing: "0.03em",
              }}
            >
              {filtered.length} / {users.length} users
            </span>
            {setRoleMutation.isError && (
              <span
                data-ocid="admin.users.error_state"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "0.9rem",
                  color: "oklch(0.72 0.20 25)",
                }}
              >
                ⚠ role change failed
              </span>
            )}
            {setRoleMutation.isSuccess && !setRoleMutation.isError && (
              <span
                data-ocid="admin.users.success_state"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "0.9rem",
                  color: "oklch(0.72 0.20 145)",
                }}
              >
                ✓ role updated
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Admin page                                                        */
/* ------------------------------------------------------------------ */

export default function Admin() {
  const { role, username, isAuthenticated } = useAuth();
  const { data, isLoading, isError, error } = useGetAllApplications();
  const acceptMutation = useAcceptApplication();
  const declineMutation = useDeclineApplication();

  const hasAccess = isAdminRole(role);
  const canReviewApps = canReview(role);
  const isAdministrator = role === Role.Administrator;

  // Two-step accept modal state: which application's rank picker is open.
  const [openAcceptId, setOpenAcceptId] = useState<bigint | null>(null);

  const handleAcceptClick = (id: bigint) => {
    setOpenAcceptId(id);
  };

  const handleAcceptConfirm = (assignedRank: RosterRank) => {
    if (openAcceptId === null || !username) return;
    acceptMutation.mutate(
      { callerUsername: username, applicationId: openAcceptId, assignedRank },
      {
        onSuccess: () => {
          setOpenAcceptId(null);
        },
      },
    );
  };

  const handleDecline = (id: bigint) => {
    declineMutation.mutate({ applicationId: id });
  };

  const applications = data ?? [];
  // Show pending first, then accepted, then declined — most actionable on top.
  const statusOrder: Record<ApplicationStatus, number> = {
    [ApplicationStatus.Pending]: 0,
    [ApplicationStatus.Accepted]: 1,
    [ApplicationStatus.Declined]: 2,
  };
  const sortedApplications = [...applications].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status],
  );

  const pendingCount = applications.filter(
    (a) => a.status === ApplicationStatus.Pending,
  ).length;

  // The application whose accept modal is currently open (if any).
  const openAcceptApplication =
    openAcceptId !== null
      ? (applications.find((a) => a.id === openAcceptId) ?? null)
      : null;

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.10 0.04 295)" }}
    >
      <Navbar />
      <main className="pt-16">
        {!hasAccess ? (
          <AccessDenied authenticated={isAuthenticated} />
        ) : (
          <FadeSection delay={300}>
            <section
              className="relative overflow-hidden"
              style={{
                background: "oklch(0.13 0.08 295)",
                borderBottom: "2px solid oklch(0.32 0.18 295)",
              }}
            >
              <div className="absolute inset-0 block-texture opacity-10" />
              <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Title */}
                <div className="text-center">
                  <div
                    className="inline-flex items-center gap-2 mb-4"
                    style={{
                      padding: "0.3rem 0.75rem",
                      background: "oklch(0.18 0.08 295)",
                      border: "1px solid oklch(0.45 0.18 295)",
                    }}
                  >
                    <Shield
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
                      {canReviewApps ? "ADMINISTRATOR" : "CO-ADMINISTRATOR"}
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
                    ADMIN PANEL
                  </h2>
                  <p
                    className="mt-4"
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1.25rem",
                      color: "oklch(0.65 0.10 295)",
                    }}
                  >
                    Review and manage role applications.
                  </p>
                </div>

                {/* Users dropdown — Administrator-only (strict === check).
                    CoAdministrators can see the Admin page but NOT this trigger. */}
                {isAdministrator && (
                  <div className="mt-6 flex justify-center">
                    <UsersDropdown callerUsername={username ?? ""} />
                  </div>
                )}

                {/* Stats bar */}
                <div
                  className="mt-8 flex flex-wrap items-center justify-center gap-4"
                  style={{ fontFamily: '"VT323", monospace' }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2"
                    style={{
                      background: "oklch(0.10 0.04 295)",
                      border: "2px solid oklch(0.30 0.10 295)",
                      boxShadow: "3px 3px 0 oklch(0.08 0.04 295)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.4rem",
                        color: "oklch(0.85 0.15 295)",
                        fontWeight: 700,
                      }}
                    >
                      {applications.length}
                    </span>
                    <span
                      style={{
                        fontSize: "0.95rem",
                        color: "oklch(0.55 0.10 295)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Total
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-4 py-2"
                    style={{
                      background: "oklch(0.10 0.04 295)",
                      border: "2px solid oklch(0.78 0.16 85 / 0.4)",
                      boxShadow: "3px 3px 0 oklch(0.08 0.04 295)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.4rem",
                        color: "oklch(0.78 0.16 85)",
                        fontWeight: 700,
                      }}
                    >
                      {pendingCount}
                    </span>
                    <span
                      style={{
                        fontSize: "0.95rem",
                        color: "oklch(0.55 0.10 295)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Pending
                    </span>
                  </div>
                </div>

                {/* Applications list */}
                <div className="mt-10">
                  {isLoading ? (
                    <LoadingState />
                  ) : isError ? (
                    <ErrorState
                      message={
                        error instanceof Error
                          ? error.message
                          : "Could not fetch applications. Please try again."
                      }
                    />
                  ) : sortedApplications.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="space-y-5">
                      {sortedApplications.map((app, i) => (
                        <ApplicationCard
                          key={app.id.toString()}
                          index={i}
                          application={app}
                          canReviewApps={canReviewApps}
                          onAccept={handleAcceptClick}
                          onDecline={handleDecline}
                          accepting={acceptMutation.isPending}
                          acceptingId={
                            acceptMutation.variables?.applicationId ?? null
                          }
                          declining={declineMutation.isPending}
                          decliningId={
                            declineMutation.variables?.applicationId ?? null
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </FadeSection>
        )}
      </main>
      <Footer />

      {/* Two-step accept modal — Administrator only, pending application */}
      {canReviewApps && openAcceptApplication && (
        <AcceptModal
          application={openAcceptApplication}
          callerUsername={username ?? ""}
          confirming={acceptMutation.isPending}
          onConfirm={handleAcceptConfirm}
          onClose={() => setOpenAcceptId(null)}
        />
      )}
    </div>
  );
}
