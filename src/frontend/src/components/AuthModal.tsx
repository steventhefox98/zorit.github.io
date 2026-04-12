import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin, useRegister } from "@/hooks/useQueries";
import { Loader2, Lock, LogIn, User, UserPlus, X } from "lucide-react";
import { useState } from "react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "login" | "register";

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login: setLoggedIn } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      const ok = await loginMutation.mutateAsync({
        username: username.trim(),
        password,
      });
      if (ok) {
        setLoggedIn(username.trim());
        setSuccess("Login successful!");
        setTimeout(() => handleClose(), 800);
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const ok = await registerMutation.mutateAsync({
        username: username.trim(),
        password,
      });
      if (ok) {
        setSuccess("Account created! Logging you in...");
        setLoggedIn(username.trim());
        setTimeout(() => handleClose(), 900);
      } else {
        setError("Username already taken. Please choose another.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "oklch(0.08 0.04 295)",
    border: "2px solid oklch(0.35 0.14 295)",
    color: "oklch(0.90 0.06 295)",
    fontFamily: '"VT323", monospace',
    fontSize: "1.1rem",
    padding: "0.6rem 0.75rem",
    width: "100%",
    outline: "none",
    letterSpacing: "0.04em",
  };

  const _inputFocusStyle = (focused: boolean): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused ? "oklch(0.62 0.22 295)" : "oklch(0.35 0.14 295)",
    boxShadow: focused ? "0 0 0 1px oklch(0.62 0.22 295 / 0.4)" : "none",
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm border-0 p-0 overflow-hidden bg-transparent shadow-none">
        <div
          className="relative rounded-none border-4 overflow-hidden"
          style={{
            background: "oklch(0.14 0.06 295)",
            borderColor: "oklch(0.45 0.20 295)",
            boxShadow:
              "0 0 0 2px oklch(0.25 0.10 295), 0 0 40px oklch(0.62 0.22 295 / 0.4), 8px 8px 0 oklch(0.08 0.03 295)",
          }}
        >
          {/* Top pixel stripe */}
          <div
            className="h-2 w-full"
            style={{
              background:
                "repeating-linear-gradient(90deg, oklch(0.62 0.22 295) 0px, oklch(0.62 0.22 295) 8px, oklch(0.45 0.18 295) 8px, oklch(0.45 0.18 295) 16px)",
            }}
          />

          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-1 transition-colors hover:opacity-70"
            style={{ color: "oklch(0.65 0.08 295)" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="p-7 pt-5">
            <DialogHeader className="mb-5">
              <div className="flex justify-center mb-3">
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-none border-2 pulse-glow-anim"
                  style={{
                    background: "oklch(0.20 0.10 295)",
                    borderColor: "oklch(0.55 0.22 295)",
                  }}
                >
                  {tab === "login" ? (
                    <LogIn
                      size={28}
                      style={{ color: "oklch(0.75 0.20 295)" }}
                    />
                  ) : (
                    <UserPlus
                      size={28}
                      style={{ color: "oklch(0.75 0.20 295)" }}
                    />
                  )}
                </div>
              </div>
              <DialogTitle
                className="text-center font-pixel leading-relaxed"
                style={{ color: "oklch(0.97 0.01 295)", fontSize: "0.6rem" }}
              >
                {tab === "login" ? "PLAYER LOGIN" : "CREATE ACCOUNT"}
              </DialogTitle>
              <DialogDescription
                className="text-center mt-1"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1rem",
                  color: "oklch(0.65 0.10 295)",
                }}
              >
                {tab === "login"
                  ? "Welcome back, legend!"
                  : "Join the ZoritLegends community"}
              </DialogDescription>
            </DialogHeader>

            {/* Tab switcher */}
            <div
              className="flex mb-5 rounded-none border-2"
              style={{ borderColor: "oklch(0.35 0.14 295)" }}
            >
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => switchTab(t)}
                  className="flex-1 py-2 font-pixel transition-all duration-150"
                  style={{
                    fontSize: "0.5rem",
                    letterSpacing: "0.06em",
                    background:
                      tab === t
                        ? "oklch(0.55 0.25 295)"
                        : "oklch(0.10 0.05 295)",
                    color:
                      tab === t ? "oklch(0.99 0 0)" : "oklch(0.60 0.10 295)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {t === "login" ? "▶ LOGIN" : "+ REGISTER"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form
              onSubmit={tab === "login" ? handleLogin : handleRegister}
              className="space-y-3"
            >
              <PixelInput
                icon={<User size={14} />}
                label="USERNAME"
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="Enter username..."
                disabled={isLoading}
              />
              <PixelInput
                icon={<Lock size={14} />}
                label="PASSWORD"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter password..."
                disabled={isLoading}
              />
              {tab === "register" && (
                <PixelInput
                  icon={<Lock size={14} />}
                  label="CONFIRM PASSWORD"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm password..."
                  disabled={isLoading}
                />
              )}

              {error && (
                <div
                  className="px-3 py-2 border-l-4 animate-fade-in"
                  style={{
                    background: "oklch(0.18 0.08 25)",
                    borderColor: "oklch(0.55 0.22 25)",
                    fontFamily: '"VT323", monospace',
                    fontSize: "0.95rem",
                    color: "oklch(0.80 0.18 25)",
                  }}
                >
                  ✗ {error}
                </div>
              )}

              {success && (
                <div
                  className="px-3 py-2 border-l-4 animate-fade-in"
                  style={{
                    background: "oklch(0.18 0.08 145)",
                    borderColor: "oklch(0.55 0.22 145)",
                    fontFamily: '"VT323", monospace',
                    fontSize: "0.95rem",
                    color: "oklch(0.75 0.18 145)",
                  }}
                >
                  ✓ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="minecraft-btn w-full py-3 px-6 flex items-center justify-center gap-2 transition-all duration-150 active:translate-y-0.5 mt-2"
                style={{
                  background: isLoading
                    ? "oklch(0.40 0.15 295)"
                    : "oklch(0.55 0.25 295)",
                  color: "oklch(0.99 0 0)",
                  border: "none",
                  boxShadow: isLoading
                    ? "none"
                    : "0 4px 0 oklch(0.30 0.15 295), inset 0 2px 0 oklch(0.70 0.22 295)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.08em",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {tab === "login" ? "LOGGING IN..." : "CREATING ACCOUNT..."}
                  </>
                ) : tab === "login" ? (
                  "▶ LOGIN"
                ) : (
                  "+ CREATE ACCOUNT"
                )}
              </button>
            </form>

            <p
              className="text-center mt-4"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "0.9rem",
                color: "oklch(0.50 0.08 295)",
              }}
            >
              {tab === "login" ? (
                <>
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("register")}
                    className="underline bg-transparent border-0 cursor-pointer"
                    style={{
                      color: "oklch(0.72 0.18 295)",
                      fontFamily: '"VT323", monospace',
                      fontSize: "0.9rem",
                    }}
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("login")}
                    className="underline bg-transparent border-0 cursor-pointer"
                    style={{
                      color: "oklch(0.72 0.18 295)",
                      fontFamily: '"VT323", monospace',
                      fontSize: "0.9rem",
                    }}
                  >
                    Login here
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Bottom pixel stripe */}
          <div
            className="h-2 w-full"
            style={{
              background:
                "repeating-linear-gradient(90deg, oklch(0.45 0.18 295) 0px, oklch(0.45 0.18 295) 8px, oklch(0.30 0.12 295) 8px, oklch(0.30 0.12 295) 16px)",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PixelInputProps {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}

function PixelInput({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  disabled,
}: PixelInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <p
        className="font-pixel mb-1 flex items-center gap-1"
        style={{
          fontSize: "0.45rem",
          color: "oklch(0.55 0.15 295)",
          letterSpacing: "0.06em",
        }}
      >
        <span style={{ color: "oklch(0.62 0.18 295)" }}>{icon}</span>
        {label}
      </p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: "oklch(0.08 0.04 295)",
          border: `2px solid ${focused ? "oklch(0.62 0.22 295)" : "oklch(0.35 0.14 295)"}`,
          boxShadow: focused ? "0 0 0 1px oklch(0.62 0.22 295 / 0.35)" : "none",
          color: "oklch(0.90 0.06 295)",
          fontFamily: '"VT323", monospace',
          fontSize: "1.1rem",
          padding: "0.55rem 0.75rem",
          width: "100%",
          outline: "none",
          letterSpacing: "0.04em",
          opacity: disabled ? 0.6 : 1,
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      />
    </div>
  );
}
