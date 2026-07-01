import { type Application, ApplicationStatus, AppliedRole } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useFadeIn } from "@/hooks/useFadeIn";
import { useGetMyApplications } from "@/hooks/useQueries";
import { useState } from "react";

/* ------------------------------------------------------------------
   MyApplicationsSection
   Shows the logged-in user's own past applications below the form.
   Hidden entirely when not authenticated. Mirrors the existing
   oklch(295) purple palette, font-pixel / VT323, block-texture overlay,
   and 4px hard box-shadow used across the Apply page.
   ------------------------------------------------------------------ */

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

/* Map the backend AppliedRole enum to the .role-badge accent classes
   defined in index.css (role-admin / role-coadmin / role-member).
   The applied role is the role the user applied FOR, not their current
   role, so we render it with the matching privilege-tier accent. */
function roleBadgeClass(appliedRole: AppliedRole): string {
  switch (appliedRole) {
    case AppliedRole.Admin:
      return "role-admin";
    case AppliedRole.Builder:
      // Builder maps to the co-admin tier accent (mid-purple).
      return "role-coadmin";
    default:
      return "role-member";
  }
}

function roleLabel(appliedRole: AppliedRole): string {
  switch (appliedRole) {
    case AppliedRole.Admin:
      return "Admin";
    case AppliedRole.Builder:
      return "Builder";
    default:
      return "Mod";
  }
}

function statusBadgeClass(status: ApplicationStatus): string {
  switch (status) {
    case ApplicationStatus.Accepted:
      return "status-accepted";
    case ApplicationStatus.Declined:
      return "status-declined";
    default:
      return "status-pending";
  }
}

function statusLabel(status: ApplicationStatus): string {
  switch (status) {
    case ApplicationStatus.Accepted:
      return "Accepted";
    case ApplicationStatus.Declined:
      return "Declined";
    default:
      return "Pending";
  }
}

/* Backend timestamp is IC Time.now() in nanoseconds. Convert to ms. */
function formatTimestamp(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  if (Number.isNaN(ms)) return "Unknown";
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

function ApplicationCard({
  application,
  index,
}: {
  application: Application;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const badgeClass = roleBadgeClass(application.appliedRole);
  const sBadgeClass = statusBadgeClass(application.status);

  return (
    <div
      className={`apply-card ${expanded ? "is-expanded" : ""} relative overflow-hidden`}
      data-ocid={`my_applications.item.${index + 1}`}
    >
      <div className="absolute inset-0 block-texture opacity-10" />
      <div className="relative z-10 p-4 sm:p-5">
        {/* Header row: role badge + status badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="font-pixel"
              style={{
                fontSize: "0.55rem",
                color: "oklch(0.62 0.22 295)",
                letterSpacing: "0.05em",
              }}
            >
              #{index + 1}
            </span>
            <span className={`role-badge ${badgeClass}`}>
              {roleLabel(application.appliedRole)}
            </span>
          </div>
          <span className={`status-badge ${sBadgeClass}`}>
            {statusLabel(application.status)}
          </span>
        </div>

        {/* Timestamp */}
        <p
          className="mt-3"
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: "1.1rem",
            color: "oklch(0.65 0.10 295)",
            letterSpacing: "0.04em",
          }}
        >
          Submitted {formatTimestamp(application.timestamp)}
        </p>

        {/* Expand / collapse answers toggle */}
        {application.answers.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="minecraft-btn mt-3 px-3 py-2 text-left"
            style={{
              color: "oklch(0.85 0.12 295)",
              background: "oklch(0.1 0.04 295)",
              border: "2px solid oklch(0.35 0.12 295)",
              boxShadow:
                "inset 0 -2px 0 0 oklch(0.08 0.04 295), inset 0 2px 0 0 oklch(0.22 0.09 295)",
            }}
            aria-expanded={expanded}
            data-ocid={`my_applications.toggle_answers.${index + 1}`}
          >
            {expanded ? "Hide Answers" : "View Answers"}
          </button>
        )}

        {expanded && application.answers.length > 0 && (
          <div
            className="apply-answers mt-3"
            data-ocid={`my_applications.answers.${index + 1}`}
          >
            {application.answers.map((answer, i) => (
              <div
                key={`q${i}-${answer.slice(0, 12)}`}
                className="mb-2 last:mb-0"
              >
                <span
                  className="font-pixel"
                  style={{
                    fontSize: "0.5rem",
                    color: "oklch(0.62 0.22 295)",
                    letterSpacing: "0.05em",
                    marginRight: "0.5rem",
                  }}
                >
                  Q{i + 1}
                </span>
                <span style={{ color: "oklch(0.85 0.10 295)" }}>{answer}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="apply-card relative overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 block-texture opacity-10" />
          <div className="relative z-10 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div
                className="h-4 w-20"
                style={{
                  background: "oklch(0.2 0.06 295)",
                  border: "1px solid oklch(0.3 0.1 295)",
                }}
              />
              <div
                className="h-4 w-24"
                style={{
                  background: "oklch(0.2 0.06 295)",
                  border: "1px solid oklch(0.3 0.1 295)",
                }}
              />
            </div>
            <div
              className="mt-3 h-4 w-40"
              style={{ background: "oklch(0.2 0.06 295)" }}
            />
            <div
              className="mt-3 h-8 w-28"
              style={{ background: "oklch(0.2 0.06 295)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="apply-card relative overflow-hidden text-center"
      data-ocid="my_applications.empty_state"
    >
      <div className="absolute inset-0 block-texture opacity-10" />
      <div className="relative z-10 px-6 py-12">
        <p
          className="font-pixel"
          style={{
            fontSize: "0.7rem",
            color: "oklch(0.62 0.22 295)",
            letterSpacing: "0.08em",
          }}
        >
          NO APPLICATIONS YET
        </p>
        <p
          className="mt-4"
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: "1.2rem",
            color: "oklch(0.65 0.10 295)",
            letterSpacing: "0.04em",
          }}
        >
          You haven&apos;t submitted any applications yet.
        </p>
        <p
          className="mt-2"
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: "1.05rem",
            color: "oklch(0.5 0.08 295)",
            letterSpacing: "0.04em",
          }}
        >
          Apply for a role above to start your journey.
        </p>
      </div>
    </div>
  );
}

export default function MyApplicationsSection() {
  const { username, isAuthenticated } = useAuth();

  /* Only the current user's own applications are ever fetched. The
     query is disabled when there is no username so the hook stays at
     the top level (useHookAtTopLevel) while the section renders
     nothing for unauthenticated users. */
  const { data, isLoading, isError } = useGetMyApplications(
    isAuthenticated ? username : null,
  );

  if (!isAuthenticated || !username) return null;

  const applications = data ?? [];

  return (
    <FadeSection delay={400}>
      <section
        className="relative overflow-hidden"
        style={{
          background: "oklch(0.11 0.05 295)",
          borderTop: "2px solid oklch(0.32 0.18 295)",
        }}
      >
        <div className="absolute inset-0 block-texture opacity-10" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2
            className="font-pixel text-center"
            style={{
              fontSize: "0.9rem",
              color: "oklch(0.97 0.01 295)",
              letterSpacing: "0.08em",
            }}
          >
            YOUR APPLICATIONS
          </h2>
          <p
            className="mt-3 text-center"
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.15rem",
              color: "oklch(0.65 0.10 295)",
              letterSpacing: "0.04em",
            }}
          >
            Track the status of your past role applications.
          </p>

          <div className="mt-8 space-y-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : isError ? (
              <div
                className="apply-card relative overflow-hidden text-center"
                data-ocid="my_applications.error_state"
              >
                <div className="absolute inset-0 block-texture opacity-10" />
                <div className="relative z-10 px-6 py-10">
                  <p
                    className="font-pixel"
                    style={{
                      fontSize: "0.65rem",
                      color: "oklch(0.62 0.24 27)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    SIGNAL LOST
                  </p>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1.1rem",
                      color: "oklch(0.65 0.10 295)",
                    }}
                  >
                    Couldn&apos;t load your applications. Try again later.
                  </p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <EmptyState />
            ) : (
              applications.map((app, i) => (
                <ApplicationCard
                  key={app.id.toString()}
                  application={app}
                  index={i}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
