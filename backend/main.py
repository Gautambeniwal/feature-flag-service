from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import HTTPException

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
# --- Pydantic Models for API Validation ---
class FlagCreate(BaseModel):
    name: str
    description: str
    default_state: bool

class FlagUpdate(BaseModel):
    state: bool

# --- In-Memory Data Stores ---
# Functions as our primary hash map for fast $O(1)$ lookups
# Format: {"dark_mode": {"description": "...", "default_state": False}}
global_flags = {}

# Stores only the customizations. If a tenant isn't here, they use the default.
# Format: {"tenant_acme": {"dark_mode": True}}
tenant_overrides = {}


# --- Endpoints ---

@app.post("/flags")
def create_flag(flag: FlagCreate):
    # We use the flag's name as its unique ID (e.g., "dark_mode")
    flag_id = flag.name.lower().replace(" ", "_")
    
    if flag_id in global_flags:
        raise HTTPException(status_code=400, detail="Flag already exists")
        
    global_flags[flag_id] = {
        "id": flag_id,
        "name": flag.name,
        "description": flag.description,
        "default_state": flag.default_state
    }
    return global_flags[flag_id]


@app.get("/flags")
def list_flags():
    return list(global_flags.values())


@app.get("/tenants/{tenant_id}/flags")
def get_tenant_flags(tenant_id: str):
    if tenant_id not in TENANTS:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    result = []
    # Fetch this specific tenant's overrides, defaulting to an empty dict if none exist
    overrides = tenant_overrides.get(tenant_id, {})
    
    for flag_id, flag_data in global_flags.items():
        is_customized = flag_id in overrides
        
        # Calculate the effective state
        if is_customized:
            effective_state = overrides[flag_id]
        else:
            effective_state = flag_data["default_state"]
            
        result.append({
            "id": flag_id,
            "name": flag_data["name"],
            "description": flag_data["description"],
            "effective_state": effective_state,
            "is_customized": is_customized,
            "default_state": flag_data["default_state"] 
        })
        
    return result


@app.put("/tenants/{tenant_id}/flags/{flag_id}")
def update_tenant_flag(tenant_id: str, flag_id: str, update_data: FlagUpdate):
    if tenant_id not in TENANTS:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if flag_id not in global_flags:
        raise HTTPException(status_code=404, detail="Flag not found")
        
    # Initialize the tenant's override dictionary if it doesn't exist yet
    if tenant_id not in tenant_overrides:
        tenant_overrides[tenant_id] = {}
        
    # Set the new custom state
    tenant_overrides[tenant_id][flag_id] = update_data.state
    
    return {"message": "Flag customized successfully", "effective_state": update_data.state}