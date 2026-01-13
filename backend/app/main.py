from datetime import datetime, timedelta
from typing import List, Optional

import asyncio
from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas
from .database import Base, engine, get_db, SessionLocal
from .simulators import wildfire_simulator, deforestation_simulator
from .auth import router as auth_router


app = FastAPI(title="EcoGuard: AI Forest Monitoring API")

# Allow local frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register auth routes (mock authority login with roles)
app.include_router(auth_router)


@app.on_event("startup")
async def on_startup() -> None:
    # Create DB tables
    Base.metadata.create_all(bind=engine)

    # Start simulators as background tasks
    asyncio.create_task(wildfire_simulator(SessionLocal))
    asyncio.create_task(deforestation_simulator(SessionLocal))


@app.get("/api/events", response_model=List[schemas.Event])
def list_events(
    event_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    region: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(models.Event)

    if event_type:
        query = query.filter(models.Event.event_type == event_type)
    if start_date:
        query = query.filter(models.Event.detected_at >= start_date)
    if end_date:
        query = query.filter(models.Event.detected_at <= end_date)
    if region:
        query = query.filter(models.Event.region == region)
    if status:
        query = query.filter(models.Event.status == status)

    query = query.order_by(models.Event.detected_at.desc()).limit(limit)
    return query.all()


@app.get("/api/events/latest", response_model=Optional[schemas.Event])
def latest_event(
    event_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Event)
    if event_type:
        query = query.filter(models.Event.event_type == event_type)

    return query.order_by(models.Event.detected_at.desc()).first()


@app.get("/api/summary", response_model=schemas.Summary)
def summary(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    live_wildfire_count = (
        db.query(models.Event)
        .filter(models.Event.event_type == "wildfire", models.Event.status == "ACTIVE")
        .count()
    )

    active_deforestation_events = (
        db.query(models.Event)
        .filter(models.Event.event_type == "deforestation")
        .count()
    )

    total_area_burnt_sq_km = (
        db.query(func.coalesce(func.sum(models.Event.area_affected_sq_km), 0.0))
        .filter(models.Event.event_type == "wildfire")
        .scalar()
    )

    total_forest_loss_sq_km_30d = (
        db.query(func.coalesce(func.sum(models.Event.area_affected_sq_km), 0.0))
        .filter(
            models.Event.event_type == "deforestation",
            models.Event.detected_at >= thirty_days_ago,
        )
        .scalar()
    )

    last_event = (
        db.query(models.Event)
        .order_by(models.Event.detected_at.desc())
        .first()
    )

    return schemas.Summary(
        live_wildfire_count=live_wildfire_count,
        active_deforestation_events=active_deforestation_events,
        total_area_burnt_sq_km=float(total_area_burnt_sq_km or 0.0),
        total_forest_loss_sq_km_30d=float(total_forest_loss_sq_km_30d or 0.0),
        last_event=last_event,
    )


@app.get("/api/analytics/fire-density-trends", response_model=schemas.FireDensityTrends)
def fire_density_trends(
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    start = now - timedelta(days=days)

    rows = (
        db.query(
            func.date(models.Event.detected_at).label("date"),
            models.Event.fire_density,
            func.count(models.Event.id),
        )
        .filter(
            models.Event.event_type == "wildfire",
            models.Event.detected_at >= start,
        )
        .group_by(func.date(models.Event.detected_at), models.Event.fire_density)
        .order_by(func.date(models.Event.detected_at))
        .all()
    )

    by_date = {}
    for date_str, density, count in rows:
        key = str(date_str)
        if key not in by_date:
            by_date[key] = {"low": 0, "medium": 0, "high": 0}
        if density == "LOW":
            by_date[key]["low"] += count
        elif density == "MEDIUM":
            by_date[key]["medium"] += count
        elif density == "HIGH":
            by_date[key]["high"] += count

    points = [
        schemas.FireDensityPoint(date=date, low=v["low"], medium=v["medium"], high=v["high"])
        for date, v in sorted(by_date.items())
    ]

    return schemas.FireDensityTrends(points=points)


@app.get("/api/analytics/forest-loss-trends", response_model=schemas.ForestLossTrends)
def forest_loss_trends(
    months: int = Query(12, le=60),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    start = now - timedelta(days=months * 30)

    rows = (
        db.query(
            func.strftime("%Y-%m", models.Event.detected_at).label("period"),
            func.coalesce(func.sum(models.Event.area_affected_sq_km), 0.0),
        )
        .filter(models.Event.event_type == "deforestation", models.Event.detected_at >= start)
        .group_by("period")
        .order_by("period")
        .all()
    )

    points = [
        schemas.ForestLossPoint(period=period, forest_loss_sq_km=float(total or 0.0))
        for period, total in rows
    ]

    return schemas.ForestLossTrends(points=points)


@app.get("/health")
async def healthcheck():
    return {"status": "ok", "service": "ecoguard-backend"}
