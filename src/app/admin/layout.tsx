import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin",           label: "📊 Übersicht",  short: "📊" },
  { href: "/admin/listings",  label: "📋 Inserate",   short: "📋" },
  { href: "/admin/users",     label: "👥 Nutzer",     short: "👥" },
  { href: "/admin/inquiries", label: "💬 Anfragen",   short: "💬" },
  { href: "/admin/blog",      label: "✍️ Blog",       short: "✍️" },
  { href: "/admin/payments",  label: "💳 Zahlungen",  short: "💳" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>

      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop" style={{
        width: 220, background: "#1a3329", padding: "24px 0", flexShrink: 0,
        position: "fixed", top: 0, left: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "white", fontWeight: 700, fontSize: 16, margin: 0 }}>Firmadeal</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "4px 0 0" }}>Admin Panel</p>
        </div>
        <nav style={{ padding: "16px 0" }}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} style={{
              display: "block", padding: "10px 20px",
              color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 14,
            }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ position: "absolute", bottom: 20, left: 20 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textDecoration: "none" }}>
            ← Zurück zur Website
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main-area" style={{ marginLeft: 220, flex: 1, padding: "32px", background: "#f5f5f5", minHeight: "100vh" }}>
        {children}
      </div>

      {/* Mobile bottom tab bar */}
      <div className="admin-mobile-tabs" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#1a3329", zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
        justifyContent: "space-around", alignItems: "stretch",
      }}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "8px 4px", color: "rgba(255,255,255,0.7)",
            textDecoration: "none", fontSize: 10, gap: 2, minHeight: 52,
          }}>
            <span style={{ fontSize: 18 }}>{item.short}</span>
            <span style={{ fontSize: 9 }}>{item.label.replace(/^[\S]+ /, "")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
