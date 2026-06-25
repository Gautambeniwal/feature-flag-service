import { useState, useEffect } from "react";

const API = "/api";

export default function App() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    fetch(`${API}/tenants`)
      .then((r) => r.json())
      .then(setTenants)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Feature Flags</h1>
      <p>
        Backend is connected — {tenants.length} tenants loaded.
      </p>

      {/* ----------------------------------------------- */}
      {/* Your feature flag UI goes below here.           */}
      {/* The /api proxy forwards to the FastAPI backend. */}
      {/* Example: fetch("/api/flags")                    */}
      {/* See README.md for the full problem statement.   */}
      {/* ----------------------------------------------- */}

      <h2>Tenants</h2>
      <ul>
        {tenants.map((t) => (
          <li key={t.id}>{t.name}</li>
        ))}
      </ul>
    </div>
  );
}
