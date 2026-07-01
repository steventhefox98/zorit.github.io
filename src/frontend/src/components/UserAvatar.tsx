import type { Avatar as AvatarVariant, BlobRef } from "@/backend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetAvatar } from "@/hooks/useQueries";

/* ------------------------------------------------------------------ */
/*  Avatar URL resolution                                             */
/* ------------------------------------------------------------------ */

/**
 * Resolve a preset id to its generated image path.
 *
 * Preset images are generated in the next wave and served from
 * /assets/generated/avatar-preset-{id}.png. The convention is fixed here
 * so the navbar, messages list, and profile page all resolve the same
 * path for a given preset id.
 */
export function presetAvatarUrl(presetId: string): string {
  return `/assets/generated/avatar-preset-${presetId}.png`;
}

/**
 * Resolve an uploaded-avatar BlobRef to its object-storage URL.
 *
 * The platform object storage serves blobs by their `key`. The download
 * helper in backend.ts (_downloadFile) is wired into actor methods that
 * return blob-typed fields, but getAvatar returns the BlobRef reference
 * directly — so we construct the URL from the key here. The key is the
 * canonical storage path; the object-storage gateway serves it at the
 * same path under the app origin.
 */
export function uploadedAvatarUrl(blob: BlobRef): string {
  // The object-storage key is already a URL-safe path segment. We serve
  // it relative to the app origin so it works in both local dev and
  // production deployments.
  return `/assets/blob/${encodeURIComponent(blob.key)}`;
}

/**
 * Resolve an Avatar variant to a displayable image URL, or null when
 * the avatar is unset / not an image variant.
 */
export function avatarImageUrl(
  avatar: AvatarVariant | null | undefined,
): string | null {
  if (!avatar) return null;
  if (avatar.__kind__ === "preset") return presetAvatarUrl(avatar.preset);
  if (avatar.__kind__ === "uploaded") return uploadedAvatarUrl(avatar.uploaded);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Size presets                                                       */
/* ------------------------------------------------------------------ */

type AvatarSize = "sm" | "md" | "lg";

interface SizeStyle {
  /** Pixel width/height of the avatar box. */
  box: number;
  /** Font size (px) for the fallback initial letter. */
  fallbackFont: number;
  /** CSS class token selecting the ring/border treatment. */
  ringClass: string;
}

const SIZE_STYLES: Record<AvatarSize, SizeStyle> = {
  // Navbar user chip — small pixelated square with purple ring.
  sm: { box: 32, fallbackFont: 20, ringClass: "navbar-avatar" },
  // Message list + bubble — slightly larger, subtle ring.
  md: { box: 36, fallbackFont: 22, ringClass: "message-avatar" },
  // Profile preview — large, handled separately by the profile page.
  lg: { box: 128, fallbackFont: 64, ringClass: "avatar-preview" },
};

/* ------------------------------------------------------------------ */
/*  UserAvatar component                                              */
/* ------------------------------------------------------------------ */

interface UserAvatarProps {
  username: string;
  size?: AvatarSize;
  /**
   * Optional pre-fetched avatar. When provided, the component skips the
   * useGetAvatar query and renders this avatar directly. Used by the
   * navbar to render the cached auth-state avatar without a separate
   * fetch.
   */
  avatar?: AvatarVariant | null;
  /** Skip the backend query entirely (e.g. when `avatar` is always supplied). */
  skipFetch?: boolean;
  className?: string;
  alt?: string;
}

export function UserAvatar({
  username,
  size = "md",
  avatar,
  skipFetch = false,
  className,
  alt,
}: UserAvatarProps) {
  // Only fetch when no avatar is passed in and fetching is not skipped.
  // The navbar passes the cached auth avatar + skipFetch to avoid a
  // redundant query on every render.
  const query = useGetAvatar(
    skipFetch || avatar !== undefined ? null : username,
  );
  const resolved: AvatarVariant | null | undefined =
    avatar !== undefined ? avatar : (query.data ?? null);

  const url = avatarImageUrl(resolved);
  const style = SIZE_STYLES[size];
  const initial = (username?.charAt(0) ?? "?").toUpperCase();

  return (
    <Avatar
      className={`${style.ringClass} ${className ?? ""}`}
      style={{
        width: style.box,
        height: style.box,
        borderRadius: 0,
        // Radix Avatar defaults to rounded-full; we override to a crisp
        // pixel square to match the Minecraft/pixel theme.
      }}
    >
      {url ? (
        <AvatarImage
          src={url}
          alt={alt ?? `${username}'s avatar`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "pixelated",
          }}
        />
      ) : null}
      <AvatarFallback
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 0,
          background: "oklch(0.18 0.09 295)",
          color: "oklch(0.85 0.15 295)",
          fontFamily: '"VT323", monospace',
          fontSize: style.fallbackFont,
          textTransform: "uppercase",
          imageRendering: "pixelated",
        }}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
