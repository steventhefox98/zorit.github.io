import { type Application, ApplicationStatus, AppliedRole } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useFadeIn } from "@/hooks/useFadeIn";
import { useSubmitApplication } from "@/hooks/useQueries";
import { Loader2, Lock, Send } from "lucide-react";
import { useState } from "react";
import AuthModal from "../components/AuthModal";
import MyApplicationsSection from "../components/MyApplicationsSection";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

/* ------------------------------------------------------------------ */
/*  The 12 application questions — exact wording, in order.            */
/* ------------------------------------------------------------------ */

interface Question {
  id: number;
  text: string;
  multiline: boolean;
}

const QUESTIONS: Question[] = [
  { id: 1, text: "Full Name", multiline: false },
  { id: 2, text: "Minecraft Username", multiline: false },
  { id: 3, text: "Discord Username (with #tag)", multiline: false },
  { id: 4, text: "Age", multiline: false },
  { id: 5, text: "Timezone", multiline: false },
  {
    id: 6,
    text: "How long have you been playing on ZoritLegends?",
    multiline: true,
  },
  {
    id: 7,
    text: "Do you have any previous experience as a Moderator, Support staff, or similar role? If yes, please describe.",
    multiline: true,
  },
  {
    id: 8,
    text: "What skills or qualities do you possess that make you a good fit for the Moderator/Support role? (e.g., communication, patience, problem-solving)",
    multiline: true,
  },
  {
    id: 9,
    text: "How would you handle a situation where a player is repeatedly breaking minor rules (e.g., spamming, mild disrespect)?",
    multiline: true,
  },
  {
    id: 10,
    text: "If a player asks you for help with an in-game issue, but you're busy with other tasks, how would you handle the situation?",
    multiline: true,
  },
  {
    id: 11,
    text: "How would you handle a situation where a player is upset about being warned or punished, and they're becoming aggressive towards staff?",
    multiline: true,
  },
  {
    id: 12,
    text: "How much time can you commit to moderating ZoritLegends each week, and are you available during peak hours?",
    multiline: true,
  },
];

const TOTAL = QUESTIONS.length;

/* ------------------------------------------------------------------ */
/*  Role picker definitions.                                          */
/* ------------------------------------------------------------------ */

interface RoleOption {
  key: AppliedRole;
  label: string;
  available: boolean;
  tag: "available" | "soon";
}

const ROLE_OPTIONS: RoleOption[] = [
  { key: AppliedRole.Mod, label: "Mod", available: true, tag: "available" },
  { key: AppliedRole.Admin, label: "Admin", available: false, tag: "soon" },
  { key: AppliedRole.Builder, label: "Builder", available: false, tag: "soon" },
];

/* ------------------------------------------------------------------ */
/*  FadeSection wrapper — matches existing pages.                     */
/* ------------------------------------------------------------------ */

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
/*  Page.                                                              */
/* ------------------------------------------------------------------ */

export default function Apply() {
  const { username, isAuthenticated } = useAuth();
  const submitMutation = useSubmitApplication();

  const [answers, setAnswers] = useState<string[]>(() =>
    Array.from({ length: TOTAL }, () => ""),
  );
  const [selectedRole, setSelectedRole] = useState<AppliedRole>(
    AppliedRole.Mod,
  );
  const [authOpen, setAuthOpen] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  const setAnswer = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const allAnswered = answers.every((a) => a.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !username) return;
    if (!allAnswered || submitMutation.isPending) return;
    try {
      const result = await submitMutation.mutateAsync({
        username,
        appliedRole: selectedRole,
        answers,
      });
      if (result.success) {
        // Build a local confirmation object so the success state can render
        // immediately even before the applications query refetches.
        setSubmittedApp({
          id: result.applicationId ?? BigInt(0),
          applicantUsername: username,
          appliedRole: selectedRole,
          answers,
          status: ApplicationStatus.Pending,
          timestamp: BigInt(Date.now()),
        });
      }
    } catch {
      /* surfaced via mutation error state */
    }
  };

  const resetForm = () => {
    setAnswers(Array.from({ length: TOTAL }, () => ""));
    setSubmittedApp(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.10 0.04 295)" }}
    >
      <Navbar />
      <main className="pt-16">
        <FadeSection delay={300}>
          <section
            className="relative overflow-hidden"
            style={{
              background: "oklch(0.13 0.08 295)",
              borderBottom: "2px solid oklch(0.32 0.18 295)",
            }}
          >
            <div className="absolute inset-0 block-texture opacity-10" />
            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
              <h2
                className="font-pixel"
                style={{
                  fontSize: "0.9rem",
                  color: "oklch(0.97 0.01 295)",
                  letterSpacing: "0.08em",
                }}
              >
                APPLY FOR A ROLE
              </h2>
              <p
                className="mt-4"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.25rem",
                  color: "oklch(0.65 0.10 295)",
                }}
              >
                Join the ZoritLegends staff team. Answer all 12 questions
                honestly — we read every application.
              </p>
            </div>
          </section>
        </FadeSection>

        <FadeSection delay={400}>
          <section className="relative overflow-hidden py-12">
            <div className="absolute inset-0 block-texture opacity-5" />
            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Not-logged-in gate */}
              {!isAuthenticated ? (
                <NotLoggedInPrompt onLogin={() => setAuthOpen(true)} />
              ) : submittedApp ? (
                <SubmittedConfirmation
                  application={submittedApp}
                  onReset={resetForm}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Role picker */}
                  <div>
                    <h3
                      className="font-pixel mb-4"
                      style={{
                        fontSize: "0.6rem",
                        color: "oklch(0.85 0.15 295)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      SELECT A ROLE
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {ROLE_OPTIONS.map((opt) => {
                        const isSelected = selectedRole === opt.key;
                        const cardClass = [
                          "role-picker-card p-4 text-left",
                          opt.available ? "is-available" : "is-coming-soon",
                          isSelected ? "is-selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <button
                            type="button"
                            key={opt.label}
                            data-ocid={`apply.role_picker.${opt.label.toLowerCase()}`}
                            disabled={!opt.available}
                            onClick={() =>
                              opt.available && setSelectedRole(opt.key)
                            }
                            className={`${cardClass} w-full appearance-none cursor-pointer disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="font-pixel"
                                style={{
                                  fontSize: "0.6rem",
                                  color: opt.available
                                    ? "oklch(0.97 0.01 295)"
                                    : "oklch(0.55 0.10 295)",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                {opt.label.toUpperCase()}
                              </span>
                              <span
                                className={`role-picker-tag ${
                                  opt.tag === "available"
                                    ? "role-picker-tag-available"
                                    : "role-picker-tag-soon"
                                }`}
                              >
                                {opt.tag === "available" ? "AVAILABLE" : "SOON"}
                              </span>
                            </div>
                            <p
                              style={{
                                fontFamily: '"VT323", monospace',
                                fontSize: "0.95rem",
                                color: opt.available
                                  ? "oklch(0.65 0.10 295)"
                                  : "oklch(0.45 0.08 295)",
                                lineHeight: 1.3,
                              }}
                            >
                              {opt.tag === "available"
                                ? "Open for applications."
                                : "Not accepting applications yet."}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {QUESTIONS.map((q, i) => (
                      <div key={q.id}>
                        <label
                          htmlFor={`q-${q.id}`}
                          className="apply-label flex items-start"
                        >
                          <span className="apply-label-index">
                            {q.id}/{TOTAL}
                          </span>
                          <span>{q.text}</span>
                        </label>
                        {q.multiline ? (
                          <textarea
                            id={`q-${q.id}`}
                            data-ocid={`apply.question.${q.id}`}
                            className="apply-input w-full mt-2 resize-y min-h-[100px]"
                            value={answers[i]}
                            onChange={(e) => setAnswer(i, e.target.value)}
                            rows={4}
                          />
                        ) : (
                          <input
                            id={`q-${q.id}`}
                            type="text"
                            data-ocid={`apply.question.${q.id}`}
                            className="apply-input w-full mt-2"
                            value={answers[i]}
                            onChange={(e) => setAnswer(i, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    {submitMutation.isError && (
                      <div
                        className="mb-4 px-4 py-3 border-l-4"
                        data-ocid="apply.error_state"
                        style={{
                          background: "oklch(0.18 0.08 25)",
                          borderColor: "oklch(0.55 0.22 25)",
                          fontFamily: '"VT323", monospace',
                          fontSize: "1rem",
                          color: "oklch(0.80 0.18 25)",
                        }}
                      >
                        ✗ Could not submit. Please try again.
                      </div>
                    )}
                    <button
                      type="submit"
                      data-ocid="apply.submit_button"
                      disabled={!allAnswered || submitMutation.isPending}
                      className="minecraft-btn w-full py-4 px-6 flex items-center justify-center gap-2 transition-all duration-150 active:translate-y-0.5"
                      style={{
                        background:
                          !allAnswered || submitMutation.isPending
                            ? "oklch(0.35 0.12 295)"
                            : "oklch(0.55 0.25 295)",
                        color: "oklch(0.99 0 0)",
                        border: "none",
                        boxShadow:
                          !allAnswered || submitMutation.isPending
                            ? "none"
                            : "0 4px 0 oklch(0.30 0.15 295), inset 0 2px 0 oklch(0.70 0.22 295)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.08em",
                        cursor:
                          !allAnswered || submitMutation.isPending
                            ? "not-allowed"
                            : "pointer",
                        opacity: !allAnswered ? 0.7 : 1,
                      }}
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          SUBMITTING...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          SUBMIT APPLICATION
                        </>
                      )}
                    </button>
                    {!allAnswered && (
                      <p
                        className="text-center mt-3"
                        style={{
                          fontFamily: '"VT323", monospace',
                          fontSize: "0.95rem",
                          color: "oklch(0.55 0.10 295)",
                        }}
                      >
                        Answer all {TOTAL} questions to enable submission.
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </section>
        </FadeSection>

        <MyApplicationsSection />
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Not-logged-in prompt.                                             */
/* ------------------------------------------------------------------ */

function NotLoggedInPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="apply-card p-8 text-center" data-ocid="apply.login_prompt">
      <div
        className="w-16 h-16 mx-auto mb-5 flex items-center justify-center pulse-glow-anim"
        style={{
          background: "oklch(0.20 0.10 295)",
          border: "2px solid oklch(0.55 0.22 295)",
        }}
      >
        <Lock size={28} style={{ color: "oklch(0.75 0.20 295)" }} />
      </div>
      <h3
        className="font-pixel mb-3"
        style={{
          fontSize: "0.7rem",
          color: "oklch(0.97 0.01 295)",
          letterSpacing: "0.08em",
        }}
      >
        LOGIN REQUIRED
      </h3>
      <p
        className="mb-6"
        style={{
          fontFamily: '"VT323", monospace',
          fontSize: "1.15rem",
          color: "oklch(0.65 0.10 295)",
          lineHeight: 1.4,
        }}
      >
        You must be logged in to submit a staff application. Create an account
        or log in to continue.
      </p>
      <button
        type="button"
        onClick={onLogin}
        data-ocid="apply.open_login_button"
        className="minecraft-btn px-6 py-3 inline-flex items-center gap-2 transition-all duration-150 active:translate-y-0.5"
        style={{
          background: "oklch(0.55 0.25 295)",
          color: "oklch(0.99 0 0)",
          border: "none",
          boxShadow:
            "0 4px 0 oklch(0.30 0.15 295), inset 0 2px 0 oklch(0.70 0.22 295)",
          fontSize: "0.6rem",
          letterSpacing: "0.08em",
          cursor: "pointer",
        }}
      >
        ⚔ LOGIN / REGISTER
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Post-submit confirmation.                                         */
/* ------------------------------------------------------------------ */

function SubmittedConfirmation({
  application,
  onReset,
}: {
  application: Application;
  onReset: () => void;
}) {
  return (
    <div className="apply-card is-expanded p-8" data-ocid="apply.success_state">
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 mx-auto mb-5 flex items-center justify-center"
          style={{
            background: "oklch(0.18 0.08 145)",
            border: "2px solid oklch(0.55 0.22 145)",
          }}
        >
          <Send size={28} style={{ color: "oklch(0.75 0.20 145)" }} />
        </div>
        <h3
          className="font-pixel mb-2"
          style={{
            fontSize: "0.7rem",
            color: "oklch(0.97 0.01 295)",
            letterSpacing: "0.08em",
          }}
        >
          APPLICATION RECEIVED
        </h3>
        <p
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: "1.15rem",
            color: "oklch(0.65 0.10 295)",
            lineHeight: 1.4,
          }}
        >
          Thank you, {application.applicantUsername}. Your application for the{" "}
          <span style={{ color: "oklch(0.75 0.20 295)" }}>
            {application.appliedRole}
          </span>{" "}
          role has been submitted and is now under review.
        </p>
      </div>

      <div
        className="flex items-center justify-center gap-3 mb-6 flex-wrap"
        style={{ borderTop: "1px solid oklch(0.25 0.10 295)" }}
      >
        <span
          className="font-pixel"
          style={{
            fontSize: "0.5rem",
            color: "oklch(0.55 0.12 295)",
            letterSpacing: "0.08em",
          }}
        >
          STATUS:
        </span>
        <span className="status-badge status-pending">PENDING</span>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onReset}
          data-ocid="apply.submit_another_button"
          className="minecraft-btn px-6 py-3 inline-flex items-center gap-2 transition-all duration-150 active:translate-y-0.5"
          style={{
            background: "oklch(0.22 0.10 295)",
            color: "oklch(0.80 0.15 295)",
            border: "2px solid oklch(0.40 0.18 295)",
            boxShadow: "0 3px 0 oklch(0.12 0.06 295)",
            fontSize: "0.55rem",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          SUBMIT ANOTHER
        </button>
      </div>
    </div>
  );
}
