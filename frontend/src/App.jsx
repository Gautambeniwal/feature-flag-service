import { useState, useEffect } from "react";

const API = "/api";

export default function App() {
  // 1. Setup State
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [flags, setFlags] = useState([]);

  // Fetch tenants on initial load
  useEffect(() => {
    fetch(`${API}/tenants`)
      .then((r) => r.json())
      .then(setTenants)
      .catch(console.error);
  }, []);

  // 2. Fetch flags when a tenant is clicked
  const handleTenantClick = (tenantId) => {
    setSelectedTenant(tenantId);
    fetch(`${API}/tenants/${tenantId}/flags`)
      .then((r) => r.json())
      .then(setFlags)
      .catch(console.error);
  };

  // 3. Toggle the flag state
  const toggleFlag = (flagId, currentState) => {
    const newState = !currentState;

    fetch(`${API}/tenants/${selectedTenant}/flags/${flagId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: newState }),
    })
      .then((r) => r.json())
      .then(() => {
        // Update the React UI instantly to reflect the successful API call
        setFlags(flags.map((flag) =>
          flag.id === flagId
            ? { ...flag, effective_state: newState, is_customized: true }
            : flag
        ));
      })
      .catch(console.error);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Feature Flags</h1>
      <p>Backend is connected - {tenants.length} tenants loaded.</p>

      <div style={{ display: "flex", gap: "3rem", marginTop: "2rem" }}>
        
        {/* --- LEFT COLUMN: TENANT LIST --- */}
        <div style={{ width: "250px" }}>
          <h2>Tenants</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {tenants.map((t) => (
              <li
                key={t.id}
                onClick={() => handleTenantClick(t.id)}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  backgroundColor: selectedTenant === t.id ? "#e0f7fa" : "#f5f5f5",
                  borderLeft: selectedTenant === t.id ? "4px solid #00bcd4" : "4px solid transparent",
                  borderRadius: "4px",
                  fontWeight: selectedTenant === t.id ? "bold" : "normal",
                  transition: "background-color 0.2s"
                }}
              >
                {t.name}
              </li>
            ))}
          </ul>
        </div>

        {/* --- RIGHT COLUMN: FLAGS UI --- */}
        <div style={{ flex: 1, maxWidth: "600px" }}>
          <h2>Flags {selectedTenant && `- ${tenants.find(t => t.id === selectedTenant)?.name}`}</h2>

          {!selectedTenant ? (
            <p style={{ color: "#666" }}>Select a tenant to view and manage their feature flags.</p>
          ) : flags.length === 0 ? (
            <p style={{ color: "#666" }}>No flags created yet. Go to your backend Swagger UI (/docs) to create some!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 8px 0" }}>{flag.name}</h3>
                    <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "0.95rem" }}>{flag.description}</p>
                    
                    {/* Visual Indicator for Customized vs Default */}
                    <span
                      style={{
                        fontSize: "0.8rem",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        backgroundColor: flag.is_customized ? "#ffe0b2" : "#e0e0e0",
                        color: flag.is_customized ? "#e65100" : "#616161"
                      }}
                    >
                      {flag.is_customized ? "Customized" : "Default"}
                    </span>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleFlag(flag.id, flag.effective_state)}
                    style={{
                      padding: "12px 24px",
                      cursor: "pointer",
                      backgroundColor: flag.effective_state ? "#4caf50" : "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      minWidth: "80px"
                    }}
                  >
                    {flag.effective_state ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}