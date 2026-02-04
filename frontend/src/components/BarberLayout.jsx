import { Link, useNavigate } from "react-router-dom";

export default function BarberLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Reusable sidebar link style (IMPORTANT)
  const sidebarLinkStyle = {
    display: "flex", 
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "8px",
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "background 0.2s",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "220px",
          background: "#111827",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
            ✂ Barber Panel
          </h3>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <Link to="/barber/dashboard" style={sidebarLinkStyle}>
             Dashboard
            </Link>

            <Link to="/barber/services" style={sidebarLinkStyle}>
              Manage Services
            </Link>

            <Link to="/barber/appointments" style={sidebarLinkStyle}>
              Appointments
            </Link>

            <Link to="/barber/leave-days" style={sidebarLinkStyle}>
              Leave Days
            </Link>
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            background: "#dc2626",
            border: "none",
            color: "#fff",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main style={{ flex: 1, padding: "20px" }}>{children}</main>
    </div>
  );
}
