from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime

from .database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    event_type = Column(String, index=True, nullable=False)  # "wildfire" or "deforestation"
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Human-readable administrative location fields
    village = Column(String, nullable=True)
    town = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)

    fire_density = Column(String, nullable=True)  # LOW / MEDIUM / HIGH
    area_affected_sq_km = Column(Float, nullable=True)
    forest_loss_percent = Column(Float, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String, default="ACTIVE")
    region = Column(String, nullable=True)
    source = Column(String, nullable=True)  # e.g., simulated-drone, simulated-sentinel
    severity = Column(String, nullable=True)  # can mirror fire_density or deforestation severity
