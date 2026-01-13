from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class EventBase(BaseModel):
    event_type: str
    latitude: float
    longitude: float

    # Human-readable administrative location fields
    village: Optional[str] = None
    town: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

    fire_density: Optional[str] = None
    area_affected_sq_km: Optional[float] = None
    forest_loss_percent: Optional[float] = None
    status: str = "ACTIVE"
    region: Optional[str] = None
    source: Optional[str] = None
    severity: Optional[str] = None


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: int
    event_id: str
    detected_at: datetime

    class Config:
        from_attributes = True


class Summary(BaseModel):
    live_wildfire_count: int
    active_deforestation_events: int
    total_area_burnt_sq_km: float
    total_forest_loss_sq_km_30d: float
    last_event: Optional[Event] = None


class FireDensityPoint(BaseModel):
    date: str
    low: int = 0
    medium: int = 0
    high: int = 0


class ForestLossPoint(BaseModel):
    period: str
    forest_loss_sq_km: float = 0.0


class FireDensityTrends(BaseModel):
    points: List[FireDensityPoint]


class ForestLossTrends(BaseModel):
    points: List[ForestLossPoint]
