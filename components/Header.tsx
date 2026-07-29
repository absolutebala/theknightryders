"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type HeaderUser = {
  name: string;
  avatarUrl: string | null;
  profileHref: string;
  isAdmin: boolean;
} | null;

const HEADER_HEIGHT = 80;

export default function Header({
  authUser,
  initialEditMode = false,
}: {
  authUser: HeaderUser;
  initialEditMode?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(initialEditMode);
  const userMenuRef = useRef<HTMLDivElement>(null);

  function toggleEditMode() {
    const next = !editMode;
    document.cookie = `edit_mode=${next}; path=/; max-age=${60 * 60 * 24 * 30}`;
    setEditMode(next);
    router.refresh();
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const solid = !isHome || scrolled;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: solid ? "var(--headerbg)" : "transparent",
          boxShadow: solid ? "0 2px 14px rgba(0,0,0,.25)" : "none",
          transition: "background-color .25s ease, box-shadow .25s ease",
        }}
      >
        <div className="nav-wrap">
          <a href="/" className="brand">
            <img
              src="https://www.theknightryders.com/wp-content/uploads/2022/03/TKR-Logo-White-1.png"
              alt="The Knight Ryders logo"
              style={{ height: 48 }}
            />
          </a>
          <nav>
            <ul>
              <li className={isActive("/rides/past") ? "current" : ""}>
                <a href="/rides/past">Past Rides</a>
              </li>
              <li className={isActive("/rides/upcoming") ? "current" : ""}>
                <a href="/rides/upcoming">Upcoming Rides</a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@TheKnightRyders1"
                  target="_blank"
                  rel="noopener"
                >
                  Videos
                </a>
              </li>
              <li className={isActive("/media") ? "current" : ""}>
                <a href="/media">Media</a>
              </li>
              <li className={isActive("/riders") ? "current" : ""}>
                <a href="/riders">Members</a>
              </li>
            </ul>
          </nav>

          {authUser?.isAdmin && (
            <button
              type="button"
              className="header-editmode-toggle"
              onClick={toggleEditMode}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "1px solid rgba(255,255,255,.3)",
                borderRadius: 20,
                padding: "5px 12px 5px 6px",
                cursor: "pointer",
                marginRight: 14,
              }}
              aria-pressed={editMode}
              aria-label="Toggle edit mode"
            >
              <span
                style={{
                  display: "inline-block",
                  width: 30,
                  height: 16,
                  borderRadius: 10,
                  background: editMode ? "var(--amber)" : "rgba(255,255,255,.25)",
                  position: "relative",
                  transition: "background-color .15s ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: editMode ? 16 : 2,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "var(--white)",
                    transition: "left .15s ease",
                  }}
                />
              </span>
              <span
                className="header-editmode-label"
                style={{ fontSize: 11.5, fontWeight: 700, color: "var(--white)", textTransform: "uppercase", letterSpacing: ".03em" }}
              >
                Edit Mode
              </span>
            </button>
          )}

          <div className="nav-cta" ref={userMenuRef} style={{ position: "relative" }}>
            {authUser ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--white)",
                }}
              >
                {authUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={authUser.avatarUrl}
                    alt={authUser.name}
                    style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "var(--amber)",
                      color: "var(--navy)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {authUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="header-username" style={{ fontSize: 13, fontWeight: 700 }}>{authUser.name}</span>
                <span style={{ fontSize: 10, color: "var(--red)" }}>&#9662;</span>
              </button>
            ) : (
              <a href="/login">Login</a>
            )}

            {authUser && userMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "130%",
                  right: 0,
                  background: "var(--headerbg)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderTop: "2px solid var(--amber)",
                  borderRadius: 8,
                  minWidth: 170,
                  padding: "8px 0",
                  boxShadow: "0 10px 24px rgba(0,0,0,.35)",
                }}
              >
                <a
                  href={authUser.profileHref}
                  style={{
                    display: "block",
                    padding: "9px 18px",
                    color: "var(--white)",
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  View Profile
                </a>
                <a
                  href="/members/edit"
                  style={{
                    display: "block",
                    padding: "9px 18px",
                    color: "var(--white)",
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Edit Profile
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 18px",
                    color: "var(--white)",
                    fontSize: 13,
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            className="menu-toggle"
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            &#9776;
          </button>
        </div>

        {mobileOpen && (
          <nav className="mobile-nav">
            <a href="/rides/past">Past Rides</a>
            <a href="/rides/upcoming">Upcoming Rides</a>
            <a href="https://www.youtube.com/@TheKnightRyders1" target="_blank" rel="noopener">
              Videos
            </a>
            <a href="/media">Media</a>
            <a href="/riders">Members</a>
            {!authUser && <a href="/login">Login</a>}
          </nav>
        )}
      </header>
      {!isHome && <div style={{ height: HEADER_HEIGHT }} />}
    </>
  );
}
