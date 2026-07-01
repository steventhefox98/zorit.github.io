import type { Avatar } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import {
  loadConfig,
  useInternetIdentity,
} from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Check, Loader2, Upload, UserCog } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { avatarImageUrl, presetAvatarUrl } from "../components/UserAvatar";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { useFadeIn } from "../hooks/useFadeIn";
import { useSetMyAvatar } from "../hooks/useQueries";

const PRESETS = [
  "steve",
  "enderman",
  "creeper",
  "zombie",
  "skeleton",
  "witch",
  "villager",
  "piglin",
  "axolotl",
  "fox",
  "bee",
  "allay",
] as const;

type BlobRef = { key: string; contentType: string };

function FadeSection({
  children,
  delay = 0,
}: { children: React.ReactNode; delay?: number }) {
  const ref = useFadeIn<HTMLDivElement>(delay);
  return <div ref={ref}>{children}</div>;
}

/**
 * ProfilePage — full avatar editor.
 *
 * Lets the user pick a preset pixel-art avatar or upload a custom image,
 * preview the selection, and save it as their avatar via the backend.
 */
export function ProfilePage() {
  const { username, role, avatar, refreshAvatar } = useAuth();
  const { identity } = useInternetIdentity();
  const headerRef = useFadeIn<HTMLDivElement>(0);
  const setMyAvatar = useSetMyAvatar();

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedUploaded, setSelectedUploaded] = useState<BlobRef | null>(
    null,
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "complete" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragover, setIsDragover] = useState(false);

  // Resolve the avatar currently shown in the preview. Selection takes
  // priority over the persisted avatar so the user sees their choice live.
  const previewAvatar: Avatar | null = selectedUploaded
    ? { __kind__: "uploaded", uploaded: selectedUploaded }
    : selectedPreset
      ? { __kind__: "preset", preset: selectedPreset }
      : (avatar ?? null);

  const previewUrl = previewAvatar ? avatarImageUrl(previewAvatar) : null;

  const resetUploadState = () => {
    setUploadProgress(0);
    setUploadStatus("idle");
    setUploadMessage("");
  };

  const processAndUploadFile = async (file: File) => {
    if (!file.type.match(/^(image\/(png|jpeg|gif|webp))$/)) {
      setUploadStatus("error");
      setUploadMessage("Unsupported file. Use PNG, JPG, GIF, or WEBP.");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("Processing image...");
    setUploadProgress(0);
    setSelectedPreset(null);

    try {
      // Load the image into an HTMLImageElement.
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = objectUrl;
      });
      URL.revokeObjectURL(objectUrl);

      // Center-crop to a 256x256 square on a canvas.
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.imageSmoothingEnabled = false;

      const sourceSize = Math.min(img.width, img.height);
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = (img.height - sourceSize) / 2;
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        256,
        256,
      );

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          "image/png",
        );
      });

      const bytes = new Uint8Array(await blob.arrayBuffer());

      setUploadMessage("Uploading...");

      const agent = await HttpAgent.create({ identity });
      const config = await loadConfig();
      // Cast through unknown to bridge the structural HttpAgent type
      // mismatch caused by duplicate @icp-sdk/core versions in the pnpm
      // tree (4.1.1 vs 5.4.0). The #private field branding makes a
      // source-level import change unable to satisfy both types.
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent as unknown as ConstructorParameters<typeof StorageClient>[4],
      );

      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setUploadProgress(pct),
      );
      const blobRef = { key: `!caf!${hash}`, contentType: "image/png" };

      setSelectedUploaded(blobRef);
      setUploadStatus("complete");
      setUploadMessage("Upload complete. Save to apply.");
    } catch (err) {
      setUploadStatus("error");
      setUploadMessage(
        err instanceof Error ? err.message : "Upload failed. Try again.",
      );
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processAndUploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processAndUploadFile(file);
  };

  const handleSave = async () => {
    if (!username) return;
    let avatarToSave: Avatar | null = null;
    if (selectedUploaded) {
      avatarToSave = { __kind__: "uploaded", uploaded: selectedUploaded };
    } else if (selectedPreset) {
      avatarToSave = { __kind__: "preset", preset: selectedPreset };
    } else {
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("Saving avatar...");

    setMyAvatar.mutate(
      { username, avatar: avatarToSave },
      {
        onSuccess: async () => {
          await refreshAvatar();
          setSaveStatus("saved");
          setSaveMessage("Avatar saved!");
          setSelectedPreset(null);
          setSelectedUploaded(null);
          resetUploadState();
          setTimeout(() => {
            setSaveStatus("idle");
            setSaveMessage("");
          }, 4000);
        },
        onError: (err) => {
          setSaveStatus("error");
          setSaveMessage(
            err instanceof Error ? err.message : "Save failed. Try again.",
          );
        },
      },
    );
  };

  const canSave =
    (selectedPreset !== null || selectedUploaded !== null) &&
    saveStatus !== "saving";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.10 0.04 295)" }}
    >
      <Navbar />
      <main className="pt-16 flex-1 flex flex-col">
        <FadeSection delay={150}>
          <section className="relative overflow-hidden flex-1 flex flex-col">
            <div className="absolute inset-0 block-texture opacity-10 pointer-events-none" />
            <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col">
              {/* Page header */}
              <div ref={headerRef} className="profile-header p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <UserCog
                    size={18}
                    style={{ color: "oklch(0.70 0.22 295)" }}
                    aria-hidden
                  />
                  <span
                    className="font-pixel"
                    style={{
                      fontSize: "0.45rem",
                      color: "oklch(0.70 0.22 295)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    ACCOUNT
                  </span>
                </div>
                <h1 className="profile-header-title">PROFILE</h1>
                <p className="profile-header-subtitle mt-3">
                  Pick a preset or upload your own — your avatar, your block.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className="font-pixel"
                    style={{
                      fontSize: "0.55rem",
                      color: "oklch(0.85 0.15 295)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {username ?? "—"}
                  </span>
                  {role && (
                    <span
                      className="role-badge role-member"
                      style={{ fontSize: "0.45rem" }}
                    >
                      {role.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Avatar preview */}
              <div className="mb-8 flex flex-col items-center">
                <div className="avatar-preview">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Current avatar preview"
                      className="avatar-preview-img"
                    />
                  ) : (
                    <div className="avatar-preview-fallback">
                      {(username ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p
                  className="mt-3"
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1.1rem",
                    color: "oklch(0.65 0.10 295)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {selectedUploaded
                    ? "Custom upload ready"
                    : selectedPreset
                      ? `Preset: ${selectedPreset}`
                      : avatar
                        ? "Current avatar"
                        : "No avatar set"}
                </p>
              </div>

              {/* Preset gallery */}
              <div className="mb-8">
                <h2
                  className="font-pixel mb-4"
                  style={{
                    fontSize: "0.6rem",
                    color: "oklch(0.85 0.12 295)",
                    letterSpacing: "0.08em",
                  }}
                >
                  PRESET AVATARS
                </h2>
                <div className="avatar-gallery">
                  {PRESETS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      data-ocid={`profile.preset.tile.${id}`}
                      className={`avatar-tile${selectedPreset === id ? " is-selected" : ""}`}
                      onClick={() => {
                        setSelectedPreset(id);
                        setSelectedUploaded(null);
                        resetUploadState();
                      }}
                      aria-pressed={selectedPreset === id}
                      aria-label={`Select ${id} preset avatar`}
                    >
                      <img
                        src={presetAvatarUrl(id)}
                        alt={`${id} preset avatar`}
                        className="avatar-tile-img"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom upload dropzone */}
              <div className="mb-8">
                <h2
                  className="font-pixel mb-4"
                  style={{
                    fontSize: "0.6rem",
                    color: "oklch(0.85 0.12 295)",
                    letterSpacing: "0.08em",
                  }}
                >
                  UPLOAD CUSTOM
                </h2>
                <button
                  type="button"
                  className={`upload-dropzone${isDragover ? " is-dragover" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragover(true);
                  }}
                  onDragLeave={() => setIsDragover(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="profile.upload.dropzone"
                  style={{ display: "block", width: "100%", textAlign: "left" }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleFileInput}
                    className="sr-only"
                    data-ocid="profile.upload.input"
                  />
                  <Upload
                    size={28}
                    style={{ color: "oklch(0.70 0.22 295)" }}
                    aria-hidden
                  />
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1.2rem",
                      color: "oklch(0.80 0.10 295)",
                    }}
                  >
                    Drop an image here, or click to browse
                  </p>
                  <p
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1rem",
                      color: "oklch(0.55 0.10 295)",
                    }}
                  >
                    PNG, JPG, GIF, or WEBP — auto-cropped to 256×256
                  </p>
                </button>

                {uploadStatus !== "idle" && (
                  <div
                    className={`upload-progress${uploadStatus === "complete" ? " is-complete" : ""}${uploadStatus === "error" ? " is-error" : ""}`}
                    data-ocid="profile.upload.progress"
                  >
                    <div
                      className="upload-progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="upload-progress-text">
                      {uploadStatus === "uploading" && (
                        <span
                          style={{
                            fontFamily: '"VT323", monospace',
                            fontSize: "1rem",
                            color: "oklch(0.80 0.10 295)",
                          }}
                        >
                          {uploadMessage} ({Math.round(uploadProgress)}%)
                        </span>
                      )}
                      {uploadStatus === "complete" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontFamily: '"VT323", monospace',
                            fontSize: "1rem",
                            color: "oklch(0.75 0.18 145)",
                          }}
                        >
                          <Check size={14} aria-hidden />
                          {uploadMessage}
                        </span>
                      )}
                      {uploadStatus === "error" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontFamily: '"VT323", monospace',
                            fontSize: "1rem",
                            color: "oklch(0.75 0.18 25)",
                          }}
                        >
                          <AlertTriangle size={14} aria-hidden />
                          {uploadMessage}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Save / Cancel actions */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <button
                  type="button"
                  className="profile-save-btn"
                  onClick={handleSave}
                  disabled={!canSave}
                  data-ocid="profile.save_button"
                >
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden />
                      SAVING...
                    </>
                  ) : saveStatus === "saved" ? (
                    <>
                      <Check size={14} aria-hidden />
                      SAVED!
                    </>
                  ) : (
                    "SAVE AVATAR"
                  )}
                </button>
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => window.history.back()}
                  data-ocid="profile.cancel_button"
                >
                  CANCEL
                </button>
              </div>

              {saveStatus === "error" && saveMessage && (
                <p
                  className="mt-3"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontFamily: '"VT323", monospace',
                    fontSize: "1rem",
                    color: "oklch(0.75 0.18 25)",
                  }}
                  data-ocid="profile.save.error_state"
                >
                  <AlertTriangle size={14} aria-hidden />
                  {saveMessage}
                </p>
              )}
            </div>
          </section>
        </FadeSection>
      </main>
      <Footer />
    </div>
  );
}

/**
 * Profile — route component. Auth-gated: unauthenticated users are
 * redirected to home. Authenticated users see ProfilePage.
 */
export default function Profile() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect unauthenticated users to home. Runs once on mount; the
  // router renders this component only when the /profile path is active.
  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
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
          REDIRECTING...
        </div>
      </div>
    );
  }

  return <ProfilePage />;
}
