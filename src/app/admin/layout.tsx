import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: "#1a3329", padding: "24px 0", flexShrink: 0,
        position: "fixed", top: 0, left: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "white", fontWeight: 700, fontSize: 16, margin: 0 }}>Firmadeal</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "4px 0 0" }}>Admin Panel</p>
        </div>
        <nav style={{ padding: "16px 0" }}>
          {[
            { href: "/admin",             label: "📊 Übersicht"  },
            { href: "/admin/listings",    label: "📋 Inserate"   },
            { href: "/admin/users",       label: "👥 Nutzer"     },
            { href: "/admin/inquiries",   label: "💬 Anfragen"   },
            { href: "/admin/blog",        label: "✍️ Blog"       },
            { href: "/admin/payments",    label: "💳 Zahlungen"  },
          ].map((item) => (
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

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, padding: "32px", background: "#f5f5f5", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}
