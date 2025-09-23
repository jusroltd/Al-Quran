from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (must use provided envs)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# Health/basic routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    # store ISO strings for dates to avoid timezone issues in Mongo
    to_store = status_obj.model_dump()
    if isinstance(to_store.get("timestamp"), datetime):
        to_store["timestamp"] = to_store["timestamp"].isoformat()
    await db.status_checks.insert_one(to_store)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(length=1000)
    parsed: List[StatusCheck] = []
    for item in status_checks:
        # Parse timestamp back if stored as string
        ts = item.get("timestamp")
        if isinstance(ts, str):
            try:
                item["timestamp"] = datetime.fromisoformat(ts)
            except Exception:
                pass
        # Remove Mongo _id if present
        item.pop("_id", None)
        parsed.append(StatusCheck(**item))
    return parsed


# Quran proxy routes (Al-Quran Cloud public API)
AL_QURAN_BASE = "https://api.alquran.cloud/v1"

async def fetch_json(url: str, params: Optional[dict] = None):
    timeout = httpx.Timeout(20.0, connect=10.0)
    async with httpx.AsyncClient(timeout=timeout) as client_http:
        r = await client_http.get(url, params=params)
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=f"Upstream error: {r.text}")
        return r.json()


@api_router.get("/quran/editions")
async def list_editions():
    data = await fetch_json(f"{AL_QURAN_BASE}/edition")
    return data


@api_router.get("/quran/surahs")
async def list_surahs():
    data = await fetch_json(f"{AL_QURAN_BASE}/surah")
    # Return the list of surahs directly for simpler frontend consumption
    if isinstance(data, dict) and "data" in data:
        return data["data"]
    return data


@api_router.get("/quran/surah/{number}")
async def get_surah(number: int, edition: str = "en.asad"):
    # Default English translation: Muhammad Asad (readable). Arabic Uthmani returned by separate request if needed.
    data = await fetch_json(f"{AL_QURAN_BASE}/surah/{number}/{edition}")
    return data


@api_router.get("/quran/surah/{number}/arabic")
async def get_surah_arabic(number: int, edition: str = "quran-uthmani"):
    data = await fetch_json(f"{AL_QURAN_BASE}/surah/{number}/{edition}")
    return data


@api_router.get("/quran/ayah/{global_number}")
async def get_ayah(global_number: int, edition: str = "en.asad"):
    data = await fetch_json(f"{AL_QURAN_BASE}/ayah/{global_number}/{edition}")
    return data


# Include the router in the main app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()