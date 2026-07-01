import { Role } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  Sword,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import AuthModal from "../AuthModal";
import JoinServerModal from "../JoinServerModal";
import LogoutConfirmModal from "../LogoutConfirmModal";
import { UserAvatar } from "../UserAvatar";

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

function isAdminRole(role: Role | null): boolean {
  return role === Role.Administrator || role === Role.CoAdministrator;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { username, role, avatar, logout, refreshRole } = useAuth();

  // Refresh the backend role on mount so the MESSAGES link reflects the
  // current role (e.g. after a two-step accept promotes the user) without
  // requiring a re-login. The role state updates reactively, so
  // showMessagesLink recomputes automatically.
  useEffect(() => {
    if (username) void refreshRole();
    // refreshRole is stable per AuthContext; re-run only when the user changes.
  }, [username, refreshRole]);

  const isHomePage = location.pathname === "/";
  const showAdminLink = isAdminRole(role);
  const showMessagesLink = isAdminRole(role);

  const handleLogoutClick = () => {
    setLogoutOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    setMenuOpen(false);
    logout();
  };

  const scrollToAnchor = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavClick = (href: string, isAnchor: boolean) => {
    setMenuOpen(false);
    if (isAnchor) {
      if (isHomePage) {
        scrollToAnchor(href);
      } else {
        navigate({ to: "/" }).then(() => {
          setTimeout(() => scrollToAnchor(href), 100);
        });
      }
    } else {
      navigate({ to: href });
    }
  };

  const navLinks = [
    { label: "Home", href: "#home", isAnchor: true },
    { label: "Features", href: "#features", isAnchor: true },
    { label: "Team", href: "/team", isAnchor: false },
    { label: "Apply", href: "/apply", isAnchor: false },
    { label: "Community", href: "/community", isAnchor: false },
    { label: "Rules", href: "/rules", isAnchor: false },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 nav-blur"
        style={{
          background: "oklch(0.10 0.05 295 / 0.92)",
          borderBottom: "2px solid oklch(0.30 0.12 295)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="flex items-center gap-3 group bg-transparent border-0 cursor-pointer transition-shadow duration-150"
            >
              <img
                src="/assets/generated/zoritlegends-logo.dim_512x128.png"
                alt="ZoritLegends"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <span
                className="hidden items-center gap-2 font-pixel text-xs"
                style={{ color: "oklch(0.85 0.18 295)", display: "none" }}
              >
                <Sword size={16} style={{ color: "oklch(0.75 0.22 295)" }} />
                ZoritLegends
              </span>
            </button>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.label}
                  onClick={() => handleNavClick(link.href, link.isAnchor)}
                  className="px-4 py-2 text-xs font-pixel transition-all duration-150 hover:opacity-80 bg-transparent border-0 cursor-pointer"
                  style={{
                    color:
                      !link.isAnchor && location.pathname === link.href
                        ? "oklch(0.97 0.01 295)"
                        : "oklch(0.80 0.10 295)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.05em",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "oklch(0.97 0.01 295)";
                  }}
                  onMouseLeave={(e) => {
                    const isActive =
                      !link.isAnchor && location.pathname === link.href;
                    (e.currentTarget as HTMLElement).style.color = isActive
                      ? "oklch(0.97 0.01 295)"
                      : "oklch(0.80 0.10 295)";
                  }}
                >
                  {link.label}
                </button>
              ))}
              {showAdminLink && (
                <button
                  type="button"
                  onClick={() => handleNavClick("/admin", false)}
                  className="px-4 py-2 text-xs font-pixel transition-all duration-150 hover:opacity-80 bg-transparent border-0 cursor-pointer flex items-center gap-1"
                  style={{
                    color:
                      location.pathname === "/admin"
                        ? "oklch(0.97 0.01 295)"
                        : "oklch(0.70 0.20 295)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.05em",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "oklch(0.97 0.01 295)";
                  }}
                  onMouseLeave={(e) => {
                    const isActive = location.pathname === "/admin";
                    (e.currentTarget as HTMLElement).style.color = isActive
                      ? "oklch(0.97 0.01 295)"
                      : "oklch(0.70 0.20 295)";
                  }}
                >
                  <Shield size={11} />
                  ADMIN
                </button>
              )}
              {showMessagesLink && (
                <button
                  type="button"
                  data-ocid="navbar.messages_link"
                  onClick={() => handleNavClick("/messages", false)}
                  className="px-4 py-2 text-xs font-pixel transition-all duration-150 hover:opacity-80 bg-transparent border-0 cursor-pointer flex items-center gap-1"
                  style={{
                    color:
                      location.pathname === "/messages"
                        ? "oklch(0.97 0.01 295)"
                        : "oklch(0.70 0.20 295)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.05em",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "oklch(0.97 0.01 295)";
                  }}
                  onMouseLeave={(e) => {
                    const isActive = location.pathname === "/messages";
                    (e.currentTarget as HTMLElement).style.color = isActive
                      ? "oklch(0.97 0.01 295)"
                      : "oklch(0.70 0.20 295)";
                  }}
                >
                  <MessageSquare size={11} />
                  MESSAGES
                </button>
              )}
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2">
              {username ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-ocid="navbar.profile_link"
                    onClick={() => navigate({ to: "/profile" })}
                    className="flex items-center gap-2 px-3 py-1.5 border-2 transition-all duration-150 cursor-pointer"
                    style={{
                      background: "oklch(0.18 0.08 295)",
                      borderColor: "oklch(0.40 0.18 295)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.55 0.20 295)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.40 0.18 295)";
                    }}
                  >
                    <UserAvatar
                      username={username}
                      avatar={avatar}
                      skipFetch
                      size="sm"
                    />
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: "0.5rem",
                        color: "oklch(0.85 0.15 295)",
                        letterSpacing: "0.05em",
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {username}
                    </span>
                    {role && (
                      <span className={ROLE_BADGE_CLASS[role]}>
                        {ROLE_LABEL[role]}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    data-ocid="navbar.logout_button"
                    onClick={handleLogoutClick}
                    className="flex items-center gap-1 px-3 py-1.5 font-pixel transition-all duration-150 border-2"
                    style={{
                      background: "oklch(0.14 0.06 295)",
                      borderColor: "oklch(0.35 0.14 295)",
                      color: "oklch(0.65 0.10 295)",
                      fontSize: "0.45rem",
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.55 0.20 25)";
                      (e.currentTarget as HTMLElement).style.color =
                        "oklch(0.75 0.18 25)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.35 0.14 295)";
                      (e.currentTarget as HTMLElement).style.color =
                        "oklch(0.65 0.10 295)";
                    }}
                  >
                    <LogOut size={11} />
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="minecraft-btn px-4 py-2 text-xs mr-1"
                  style={{
                    background: "oklch(0.22 0.10 295)",
                    color: "oklch(0.80 0.15 295)",
                    boxShadow:
                      "0 3px 0 oklch(0.12 0.06 295), inset 0 1px 0 oklch(0.35 0.14 295)",
                    fontSize: "0.5rem",
                    letterSpacing: "0.08em",
                    border: "2px solid oklch(0.40 0.18 295)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "oklch(0.28 0.12 295)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "oklch(0.22 0.10 295)";
                  }}
                >
                  ⚔ LOGIN
                </button>
              )}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="minecraft-btn px-5 py-2.5 text-xs"
                style={{
                  background: "oklch(0.55 0.25 295)",
                  color: "oklch(0.99 0 0)",
                  boxShadow:
                    "0 3px 0 oklch(0.30 0.15 295), inset 0 1px 0 oklch(0.70 0.22 295)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.08em",
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
                ▶ JOIN NOW
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ color: "oklch(0.80 0.10 295)" }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t"
            style={{
              background: "oklch(0.10 0.05 295 / 0.98)",
              borderColor: "oklch(0.30 0.12 295)",
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.label}
                  onClick={() => handleNavClick(link.href, link.isAnchor)}
                  className="block w-full text-left px-3 py-3 font-pixel text-xs bg-transparent border-0 cursor-pointer"
                  style={{
                    color:
                      !link.isAnchor && location.pathname === link.href
                        ? "oklch(0.97 0.01 295)"
                        : "oklch(0.80 0.10 295)",
                    fontSize: "0.55rem",
                  }}
                >
                  {link.label}
                </button>
              ))}
              {showAdminLink && (
                <button
                  type="button"
                  onClick={() => handleNavClick("/admin", false)}
                  className="flex items-center gap-2 w-full text-left px-3 py-3 font-pixel text-xs bg-transparent border-0 cursor-pointer"
                  style={{
                    color:
                      location.pathname === "/admin"
                        ? "oklch(0.97 0.01 295)"
                        : "oklch(0.70 0.20 295)",
                    fontSize: "0.55rem",
                  }}
                >
                  <Shield size={12} />
                  ADMIN
                </button>
              )}
              {showMessagesLink && (
                <button
                  type="button"
                  data-ocid="navbar.messages_link"
                  onClick={() => handleNavClick("/messages", false)}
                  className="flex items-center gap-2 w-full text-left px-3 py-3 font-pixel text-xs bg-transparent border-0 cursor-pointer"
                  style={{
                    color:
                      location.pathname === "/messages"
                        ? "oklch(0.97 0.01 295)"
                        : "oklch(0.70 0.20 295)",
                    fontSize: "0.55rem",
                  }}
                >
                  <MessageSquare size={12} />
                  MESSAGES
                </button>
              )}

              {username ? (
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    data-ocid="navbar.profile_link"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate({ to: "/profile" });
                    }}
                    className="flex items-center gap-2 px-3 py-2 border-2 flex-wrap w-full text-left transition-all duration-150 cursor-pointer"
                    style={{
                      background: "oklch(0.18 0.08 295)",
                      borderColor: "oklch(0.40 0.18 295)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.55 0.20 295)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "oklch(0.40 0.18 295)";
                    }}
                  >
                    <UserAvatar
                      username={username}
                      avatar={avatar}
                      skipFetch
                      size="sm"
                    />
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: "0.5rem",
                        color: "oklch(0.85 0.15 295)",
                      }}
                    >
                      {username}
                    </span>
                    {role && (
                      <span className={ROLE_BADGE_CLASS[role]}>
                        {ROLE_LABEL[role]}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    data-ocid="navbar.logout_button"
                    onClick={handleLogoutClick}
                    className="flex items-center gap-2 w-full px-3 py-2 font-pixel border-2 bg-transparent cursor-pointer"
                    style={{
                      borderColor: "oklch(0.35 0.14 295)",
                      color: "oklch(0.65 0.10 295)",
                      fontSize: "0.5rem",
                    }}
                  >
                    <LogOut size={12} />
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthOpen(true);
                    setMenuOpen(false);
                  }}
                  className="minecraft-btn w-full mt-2 py-3 text-xs border-2"
                  style={{
                    background: "oklch(0.22 0.10 295)",
                    color: "oklch(0.80 0.15 295)",
                    boxShadow: "0 3px 0 oklch(0.12 0.06 295)",
                    fontSize: "0.55rem",
                    borderColor: "oklch(0.40 0.18 295)",
                  }}
                >
                  ⚔ LOGIN / REGISTER
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setModalOpen(true);
                  setMenuOpen(false);
                }}
                className="minecraft-btn w-full mt-2 py-3 text-xs"
                style={{
                  background: "oklch(0.55 0.25 295)",
                  color: "oklch(0.99 0 0)",
                  boxShadow: "0 3px 0 oklch(0.30 0.15 295)",
                  fontSize: "0.55rem",
                }}
              >
                ▶ JOIN NOW
              </button>
            </div>
          </div>
        )}
      </nav>

      <JoinServerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <LogoutConfirmModal
        open={logoutOpen}
        username={username}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}
