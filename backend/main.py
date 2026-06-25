from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Feature Flag Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-seeded tenants — treat as read-only fixture data
TENANTS = {
    "tenant_acme": {"id": "tenant_acme", "name": "Acme Corp"},
    "tenant_globex": {"id": "tenant_globex", "name": "Globex Inc"},
    "tenant_initech": {"id": "tenant_initech", "name": "Initech LLC"},
    "tenant_umbrella": {"id": "tenant_umbrella", "name": "Umbrella Holdings"},
}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/tenants")
def list_tenants():
    return list(TENANTS.values())


# -------------------------------------------------------
# Your feature flag endpoints go below here.
#
# See README.md for the full problem statement.
# -------------------------------------------------------
