import { type Comment, type Post, PostType, Role, VoteStatus } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import {
  useActiveCommunityPosts,
  useAddCommunityComment,
  useCommunityComments,
  useCommunityVoteTally,
  useCreateCommunityPost,
  useVoteOnCommunityPost,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "../components/UserAvatar";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { useFadeIn } from "../hooks/useFadeIn";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAILY_CAP = 5;

const POST_TYPE_TABS: { type: PostType; label: string }[] = [
  { type: PostType.bugReport, label: "Bug Reports" },
  { type: PostType.suggestion, label: "Suggestions" },
  { type: PostType.eventSuggestion, label: "Event Suggestions" },
];

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
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function isAdminRole(role: Role | null): boolean {
  return role === Role.Administrator || role === Role.CoAdministrator;
}

function timeAgo(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  if (!Number.isFinite(ms) || ms <= 0) return "Unknown";
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const diffMs = Date.now() - ms;
  if (diffMs < 0) return "just now";
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
            ? "You don't have permission to view the community board."
            : "You must be signed in to view and contribute to the community board."}
        </p>
        <button
          type="button"
          data-ocid="community.back_home_button"
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
/*  Post creation form                                                 */
/* ------------------------------------------------------------------ */

interface PostFormProps {
  postType: PostType;
  authorUsername: string;
  postsToday: number;
}

function PostForm({ postType, authorUsername, postsToday }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const createMutation = useCreateCommunityPost();

  const remaining = Math.max(0, DAILY_CAP - postsToday);
  const capReached = remaining <= 0;
  const meterPct = Math.min(100, (postsToday / DAILY_CAP) * 100);

  const canSubmit =
    !capReached && title.trim().length > 0 && body.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createMutation.mutate(
      {
        postType,
        title: title.trim(),
        body: body.trim(),
        authorUsername,
      },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
        },
      },
    );
  };

  return (
    <div
      className="relative overflow-hidden p-5"
      style={{
        background: "oklch(0.12 0.06 295)",
        border: "2px solid oklch(0.30 0.10 295)",
        boxShadow: "4px 4px 0px oklch(0.08 0.04 295)",
      }}
    >
      <div className="absolute inset-0 block-texture opacity-10 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3
            className="font-pixel"
            style={{
              fontSize: "0.6rem",
              color: "oklch(0.85 0.12 295)",
              letterSpacing: "0.08em",
            }}
          >
            NEW POST
          </h3>
          {/* Daily-cap meter */}
          <div className="flex items-center gap-2 min-w-[180px] flex-1 max-w-xs">
            <span
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "0.95rem",
                color: capReached
                  ? "oklch(0.75 0.20 27)"
                  : "oklch(0.65 0.10 295)",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              {remaining}/{DAILY_CAP} LEFT
            </span>
            <div className="daily-cap-meter flex-1">
              <span style={{ width: `${meterPct}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <input
            data-ocid="community.title_input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            disabled={capReached}
            maxLength={120}
            aria-label="Post title"
            className="apply-input w-full"
            style={{ opacity: capReached ? 0.5 : 1 }}
          />
          <textarea
            data-ocid="community.body_input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the bug, suggestion, or event idea..."
            disabled={capReached}
            rows={3}
            maxLength={1000}
            aria-label="Post body"
            className="apply-input w-full resize-none"
            style={{ opacity: capReached ? 0.5 : 1 }}
          />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "0.95rem",
                color: "oklch(0.55 0.10 295)",
                letterSpacing: "0.03em",
              }}
            >
              {capReached
                ? "Daily limit reached — try again tomorrow."
                : `Max ${DAILY_CAP} posts per category per day.`}
            </span>
            <button
              type="button"
              data-ocid="community.submit_button"
              onClick={handleSubmit}
              disabled={!canSubmit || createMutation.isPending}
              className="minecraft-btn flex items-center gap-2 px-5 py-2.5"
              style={{
                background: "oklch(0.55 0.25 295)",
                color: "oklch(0.99 0 0)",
                boxShadow:
                  "0 3px 0 oklch(0.30 0.15 295), inset 0 1px 0 oklch(0.70 0.22 295)",
                fontSize: "0.5rem",
                letterSpacing: "0.08em",
                border: "2px solid oklch(0.40 0.18 295)",
                cursor:
                  !canSubmit || createMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                opacity: !canSubmit || createMutation.isPending ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!canSubmit || createMutation.isPending) return;
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.62 0.25 295)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.55 0.25 295)";
              }}
            >
              {createMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              POST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Comment thread                                                     */
/* ------------------------------------------------------------------ */

interface CommentThreadProps {
  postId: bigint;
  canComment: boolean;
  currentUsername: string;
  isStaff: boolean;
}

function CommentThread({
  postId,
  canComment,
  currentUsername,
  isStaff,
}: CommentThreadProps) {
  const { data, isLoading, isError } = useCommunityComments(postId);
  const addMutation = useAddCommunityComment();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  // Auto-scroll to newest comment on growth.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const grew = (data?.length ?? 0) > lastCountRef.current;
    lastCountRef.current = data?.length ?? 0;
    if (grew) el.scrollTop = el.scrollHeight;
  }, [data?.length]);

  const comments = data ?? [];

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || addMutation.isPending) return;
    addMutation.mutate(
      { postId, authorUsername: currentUsername, content: trimmed },
      { onSuccess: () => setDraft("") },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="comment-thread mt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={12} style={{ color: "oklch(0.62 0.22 295)" }} />
        <span
          className="font-pixel"
          style={{
            fontSize: "0.5rem",
            color: "oklch(0.65 0.12 295)",
            letterSpacing: "0.08em",
          }}
        >
          COMMENTS ({comments.length})
        </span>
      </div>

      <div
        ref={scrollRef}
        className="space-y-3 max-h-[280px] overflow-y-auto pr-1"
      >
        {isLoading ? (
          <div
            data-ocid={`community.comments.loading_state.${postId}`}
            className="flex items-center justify-center gap-2 py-6"
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
            LOADING COMMENTS...
          </div>
        ) : isError ? (
          <div
            data-ocid={`community.comments.error_state.${postId}`}
            className="flex items-center gap-2 py-4"
            style={{
              fontFamily: '"VT323", monospace',
              color: "oklch(0.62 0.24 27)",
              fontSize: "1rem",
            }}
          >
            <AlertTriangle size={14} />
            Failed to load comments.
          </div>
        ) : comments.length === 0 ? (
          <div
            data-ocid={`community.comments.empty_state.${postId}`}
            className="text-center py-6"
            style={{
              fontFamily: '"VT323", monospace',
              color: "oklch(0.50 0.08 295)",
              fontSize: "1.05rem",
            }}
          >
            No comments yet.
          </div>
        ) : (
          comments.map((c: Comment, i) => {
            const isSelf = c.authorUsername === currentUsername;
            const cls = isSelf
              ? "comment-bubble is-self"
              : isStaff
                ? "comment-bubble is-staff"
                : "comment-bubble";
            return (
              <div
                key={c.id.toString()}
                data-ocid={`community.comment.item.${i + 1}`}
                className="flex"
              >
                <div className={cls}>
                  <div className="flex items-center gap-2 mb-1">
                    <UserAvatar
                      username={c.authorUsername}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <span className="comment-author">{c.authorUsername}</span>
                    {isStaff && !isSelf && (
                      <span
                        className="font-pixel"
                        style={{
                          fontSize: "0.4rem",
                          color: "oklch(0.7 0.22 295)",
                          letterSpacing: "0.08em",
                          padding: "0.1rem 0.3rem",
                          border: "1px solid oklch(0.45 0.18 295)",
                          background: "oklch(0.18 0.08 295)",
                        }}
                      >
                        STAFF
                      </span>
                    )}
                  </div>
                  <p className="comment-body break-words">{c.content}</p>
                  <div className="comment-time mt-1">
                    {timeAgo(c.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comment input — staff or original submitter only */}
      {canComment ? (
        <div
          className="flex items-end gap-2 mt-3 pt-3 border-t"
          style={{ borderColor: "oklch(0.30 0.10 295)" }}
        >
          <textarea
            data-ocid={`community.comment.input.${postId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            rows={1}
            disabled={addMutation.isPending}
            aria-label="Add a comment"
            className="apply-input flex-1 resize-none"
            style={{
              minHeight: "40px",
              maxHeight: "120px",
              opacity: addMutation.isPending ? 0.6 : 1,
            }}
          />
          <button
            type="button"
            data-ocid={`community.comment.send_button.${postId}`}
            onClick={handleSend}
            disabled={addMutation.isPending || !draft.trim()}
            aria-label="Send comment"
            className="minecraft-btn flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
            style={{
              background: "oklch(0.55 0.25 295)",
              color: "oklch(0.99 0 0)",
              boxShadow:
                "0 3px 0 oklch(0.30 0.15 295), inset 0 1px 0 oklch(0.70 0.22 295)",
              fontSize: "0.5rem",
              letterSpacing: "0.08em",
              border: "2px solid oklch(0.40 0.18 295)",
              cursor:
                addMutation.isPending || !draft.trim()
                  ? "not-allowed"
                  : "pointer",
              opacity: addMutation.isPending || !draft.trim() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (addMutation.isPending || !draft.trim()) return;
              (e.currentTarget as HTMLElement).style.background =
                "oklch(0.62 0.25 295)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "oklch(0.55 0.25 295)";
            }}
          >
            {addMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            SEND
          </button>
        </div>
      ) : (
        <div
          className="mt-3 pt-3 border-t"
          style={{ borderColor: "oklch(0.30 0.10 295)" }}
        >
          <span className="locked-indicator">
            COMMENTS LOCKED — STAFF &amp; AUTHOR ONLY
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Post card                                                          */
/* ------------------------------------------------------------------ */

interface PostCardProps {
  index: number;
  post: Post;
  isStaff: boolean;
  currentUsername: string;
}

function PostCard({ index, post, isStaff, currentUsername }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const tally = useCommunityVoteTally(expanded ? post.id : null);
  const voteMutation = useVoteOnCommunityPost();

  const approved = tally.data?.approved ?? 0n;
  const rejected = tally.data?.rejected ?? 0n;

  const isAuthor = post.authorUsername === currentUsername;
  const canComment = isStaff || isAuthor;

  const handleVote = (status: VoteStatus) => {
    voteMutation.mutate({
      postId: post.id,
      voterUsername: currentUsername,
      status,
    });
  };

  const bodyPreview =
    post.body.length > 180 ? `${post.body.slice(0, 180)}…` : post.body;

  return (
    <div
      data-ocid={`community.post.item.${index + 1}`}
      className={`post-card${expanded ? " is-expanded" : ""}`}
    >
      <div className="absolute inset-0 block-texture opacity-10 pointer-events-none" />
      <div className="relative z-10 p-4 sm:p-5">
        {/* Header row */}
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
                {post.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <UserAvatar
                username={post.authorUsername}
                size="sm"
                className="flex-shrink-0"
              />
              <span
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "0.95rem",
                  color: "oklch(0.62 0.18 295)",
                  letterSpacing: "0.04em",
                }}
              >
                by {post.authorUsername}
              </span>
              <span
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "0.95rem",
                  color: "oklch(0.50 0.08 295)",
                }}
              >
                · {timeAgo(post.createdAt)}
              </span>
            </div>
          </div>

          <button
            type="button"
            data-ocid={`community.toggle_button.${index + 1}`}
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse post" : "Expand post"}
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

        {/* Body preview */}
        <p
          className="mt-3 break-words"
          style={{
            fontFamily: '"Cinzel", serif',
            fontSize: "0.95rem",
            lineHeight: 1.5,
            color: "oklch(0.85 0.06 295)",
          }}
        >
          {expanded ? post.body : bodyPreview}
        </p>

        {/* Vote tally + staff vote buttons */}
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="vote-tally vote-tally-approve">
              <Check size={12} />
              {approved.toString()}
            </span>
            <span className="vote-tally vote-tally-reject">
              <X size={12} />
              {rejected.toString()}
            </span>
          </div>

          {isStaff && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid={`community.approve_button.${index + 1}`}
                onClick={() => handleVote(VoteStatus.approved)}
                disabled={voteMutation.isPending}
                aria-label="Approve post"
                className="vote-btn vote-btn-approve"
              >
                <Check size={12} />
                APPROVE
              </button>
              <button
                type="button"
                data-ocid={`community.reject_button.${index + 1}`}
                onClick={() => handleVote(VoteStatus.rejected)}
                disabled={voteMutation.isPending}
                aria-label="Reject post"
                className="vote-btn vote-btn-reject"
              >
                <X size={12} />
                REJECT
              </button>
            </div>
          )}
        </div>

        {/* Expandable comment thread */}
        {expanded && (
          <CommentThread
            postId={post.id}
            canComment={canComment}
            currentUsername={currentUsername}
            isStaff={isStaff}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty / loading / error states                                     */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div
      data-ocid="community.empty_state"
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
          NO POSTS YET
        </h3>
        <p
          className="mt-3"
          style={{
            fontFamily: '"VT323", monospace',
            fontSize: "1.15rem",
            color: "oklch(0.55 0.10 295)",
          }}
        >
          Be the first to submit a post in this category.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      data-ocid="community.loading_state"
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
        LOADING POSTS...
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      data-ocid="community.error_state"
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
/*  Community page                                                     */
/* ------------------------------------------------------------------ */

export default function Community() {
  const { username, role, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<PostType>(PostType.bugReport);

  const hasAccess = !!username;
  const isStaff = isAdminRole(role);

  const postsQuery = useActiveCommunityPosts(activeTab);
  const posts = postsQuery.data ?? [];

  // Count posts by the current user in the active category for the daily cap.
  // The backend exposes only active posts; we approximate "today" by counting
  // the user's posts created within the last 24h.
  const oneDayAgoNs = BigInt(Date.now() * 1_000_000) - 86_400_000_000_000n;
  const postsToday = posts.filter(
    (p) => p.authorUsername === username && p.createdAt >= oneDayAgoNs,
  ).length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.10 0.04 295)" }}
    >
      <Navbar />
      <main className="pt-16 flex-1 flex flex-col">
        {!hasAccess ? (
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
              <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col">
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
                      COMMUNITY
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
                    COMMUNITY BOARD
                  </h2>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1.2rem",
                      color: "oklch(0.65 0.10 295)",
                    }}
                  >
                    Report bugs, suggest ideas, and propose events. Staff vote
                    to approve or reject.
                  </p>
                </div>

                {/* Tabs */}
                <div
                  className="flex flex-wrap gap-2 justify-center mb-6"
                  role="tablist"
                >
                  {POST_TYPE_TABS.map((tab) => {
                    const isActive = activeTab === tab.type;
                    return (
                      <button
                        key={tab.type}
                        type="button"
                        data-ocid={`community.tab.${tab.type}`}
                        onClick={() => setActiveTab(tab.type)}
                        role="tab"
                        aria-selected={isActive}
                        className={`community-tab${isActive ? " is-active" : ""}`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Post creation form */}
                <div className="mb-6">
                  <PostForm
                    postType={activeTab}
                    authorUsername={username ?? ""}
                    postsToday={postsToday}
                  />
                </div>

                {/* Posts list */}
                <div className="flex-1">
                  {postsQuery.isLoading ? (
                    <LoadingState />
                  ) : postsQuery.isError ? (
                    <ErrorState
                      message={
                        postsQuery.error instanceof Error
                          ? postsQuery.error.message
                          : "Could not fetch posts. Please try again."
                      }
                    />
                  ) : posts.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="space-y-5">
                      {posts.map((post, i) => (
                        <PostCard
                          key={post.id.toString()}
                          index={i}
                          post={post}
                          isStaff={isStaff}
                          currentUsername={username ?? ""}
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
    </div>
  );
}
