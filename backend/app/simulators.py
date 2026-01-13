import asyncio
import random
import string
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from . import models


def _random_id(prefix: str) -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{suffix}"


def _random_coord() -> tuple[float, float]:
    # Example: somewhere over a generic forested region (lat, lon)
    # You can adjust this bounding box to match your country/area of interest.
    lat = random.uniform(8.0, 20.0)
    lon = random.uniform(72.0, 90.0)
    return lat, lon


def _fake_location_for_coord(lat: float, lon: float) -> dict:
    """Return a fake but human-readable administrative location for demo purposes.

    In production you would integrate reverse geocoding or GIS here.
    """
    villages = ["Green Valley", "Pine Ridge", "Riverbend", "Forest Edge"]
    towns = ["Northwood", "Cedar Town", "Oak Junction"]
    districts = ["Central Forest Division", "Eastern Range", "Western Range"]
    states = ["Demo Forest State"]
    countries = ["DemoLand"]

    return {
        "village": random.choice(villages),
        "town": random.choice(towns),
        "district": random.choice(districts),
        "state": random.choice(states),
        "country": random.choice(countries),
    }


def _insert_event(db: Session, event: models.Event) -> None:
    db.add(event)
    db.commit()
    db.refresh(event)


async def wildfire_simulator(db_factory, interval_seconds: int = 20) -> None:
    """Periodically inserts simulated wildfire events into the database."""
    while True:
        await asyncio.sleep(interval_seconds)
        db: Session = db_factory()
        try:
            lat, lon = _random_coord()
            density = random.choices(["LOW", "MEDIUM", "HIGH"], weights=[0.5, 0.3, 0.2])[0]
            area = round(random.uniform(0.5, 5.0), 2)
            loc = _fake_location_for_coord(lat, lon)

            event = models.Event(
                event_id=_random_id("WF"),
                event_type="wildfire",
                latitude=lat,
                longitude=lon,
                village=loc["village"],
                town=loc["town"],
                district=loc["district"],
                state=loc["state"],
                country=loc["country"],
                fire_density=density,
                area_affected_sq_km=area,
                detected_at=datetime.utcnow(),
                status="ACTIVE",
                region="Simulated Forest Region",
                source="simulated-drone",
                severity=density,
            )
            _insert_event(db, event)
        finally:
            db.close()


async def deforestation_simulator(db_factory, interval_seconds: int = 60) -> None:
    """Periodically inserts simulated deforestation events into the database."""
    while True:
        await asyncio.sleep(interval_seconds)
        db: Session = db_factory()
        try:
            lat, lon = _random_coord()
            loss_percent = round(random.uniform(5.0, 60.0), 1)
            area = round(random.uniform(1.0, 10.0), 2)
            loc = _fake_location_for_coord(lat, lon)

            event = models.Event(
                event_id=_random_id("DF"),
                event_type="deforestation",
                latitude=lat,
                longitude=lon,
                village=loc["village"],
                town=loc["town"],
                district=loc["district"],
                state=loc["state"],
                country=loc["country"],
                forest_loss_percent=loss_percent,
                area_affected_sq_km=area,
                detected_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
                status="RECORDED",
                region="Simulated Forest Region",
                source="simulated-sentinel",
                severity="HIGH" if loss_percent > 40 else "MEDIUM" if loss_percent > 20 else "LOW",
            )
            _insert_event(db, event)
        finally:
            db.close()
