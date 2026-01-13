from typing import List

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel


router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
  username: str
  password: str


class LoginResponse(BaseModel):
  access_token: str
  token_type: str = "bearer"
  username: str
  display_name: str
  roles: List[str]


MOCK_USERS = {
  "forest_officer": {
    "password": "password123",
    "roles": ["FOREST_OFFICER"],
    "display_name": "Forest Officer (Demo)",
  },
  "district_admin": {
    "password": "password123",
    "roles": ["DISTRICT_ADMIN"],
    "display_name": "District Admin (Demo)",
  },
  "state_control": {
    "password": "password123",
    "roles": ["STATE_CONTROL_ROOM"],
    "display_name": "State Control Room (Demo)",
  },
}


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
  """Mock authority login.

  This endpoint performs a simple username/password check against in-memory
  demo users and returns a fake bearer token plus role tags. No real security
  is provided; this is intended for UI demos only.
  """
  user = MOCK_USERS.get(payload.username)
  if not user or payload.password != user["password"]:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid credentials (demo auth)",
    )

  token = f"mock-token-{payload.username}"
  return LoginResponse(
    access_token=token,
    username=payload.username,
    display_name=user["display_name"],
    roles=user["roles"],
  )
