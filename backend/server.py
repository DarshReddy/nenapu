from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import httpx
import base64


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class MotifGenerationRequest(BaseModel):
    prompt: str
    count: int = 4
    section: str
    keyword: str

class FinalizeDesignRequest(BaseModel):
    prompt: str
    sareeState: dict

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/generate-motifs")
async def generate_motifs(request: MotifGenerationRequest):
    """
    Generate Kanjeevaram saree motifs using Gemini 2.0 Flash Image Generation
    """
    try:
        # Use Emergent LLM key for Google Gemini
        api_key = "sk-emergent-4A7F72a58F04b5bEc1"
        
        # Generate motifs using Google's Imagen 3
        motifs = []
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            for i in range(request.count):
                # Call Google Gemini API for image generation
                response = await client.post(
                    "https://api.emergent.sh/v1/images/generations",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "imagen-3.0-generate-001",
                        "prompt": request.prompt,
                        "n": 1,
                        "size": "1024x1024",
                        "response_format": "url"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("data") and len(data["data"]) > 0:
                        image_url = data["data"][0].get("url")
                        if image_url:
                            motifs.append(image_url)
                else:
                    logger.error(f"Image generation failed: {response.status_code} - {response.text}")
        
        if len(motifs) == 0:
            # Fallback: return placeholder images
            logger.warning("No motifs generated, using placeholder images")
            motifs = [
                f"https://placehold.co/400x400/8B0000/FFD700?text=Motif+{i+1}"
                for i in range(request.count)
            ]
        
        logger.info(f"Generated {len(motifs)} motifs for {request.section} with keyword: {request.keyword}")
        
        return {"motifs": motifs, "section": request.section, "keyword": request.keyword}
        
    except Exception as e:
        logger.error(f"Error generating motifs: {str(e)}")
        # Return placeholder images on error
        return {
            "motifs": [
                f"https://placehold.co/400x400/8B0000/FFD700?text=Motif+{i+1}"
                for i in range(request.count)
            ],
            "section": request.section,
            "keyword": request.keyword,
            "error": str(e)
        }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()