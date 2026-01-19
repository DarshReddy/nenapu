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
from google import genai
from google.genai import types


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

class SareePreviewRequest(BaseModel):
    prompt: str
    sareeState: dict
    images: dict = {}  # Optional dict with keys: body, border, pallu containing base64 images

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
    Generate Kanjeevaram saree motifs using Gemini 2.0 Flash with image generation
    """
    try:
        # Initialize Google GenAI client
        client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))

        motifs = []

        for i in range(request.count):
            try:
                # Generate image using Gemini 2.0 Flash
                response = client.models.generate_content(
                    model='gemini-2.0-flash-exp-image-generation',
                    contents=request.prompt,
                    config=types.GenerateContentConfig(
                        response_modalities=['TEXT', 'IMAGE']
                    )
                )

                # Extract image from response
                if response.candidates and len(response.candidates) > 0:
                    for part in response.candidates[0].content.parts:
                        if part.inline_data:
                            image_data = part.inline_data.data
                            mime_type = part.inline_data.mime_type
                            base64_image = base64.b64encode(image_data).decode('utf-8')
                            data_url = f"data:{mime_type};base64,{base64_image}"
                            motifs.append(data_url)
                            logger.info(f"Generated motif {i+1}/{request.count}")
                            break

            except Exception as img_error:
                logger.error(f"Error generating motif {i+1}: {str(img_error)}")

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

@api_router.post("/finalize-design")
async def finalize_design(request: FinalizeDesignRequest):
    """
    Generate a professional fashion photograph of the complete custom saree
    """
    try:
        # Initialize Google GenAI client
        client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))

        logger.info(f"Generating final saree design with prompt: {request.prompt[:100]}...")

        # Generate image using Gemini 2.0 Flash
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp-image-generation',
            contents=request.prompt,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']
            )
        )

        # Extract image from response
        if response.candidates and len(response.candidates) > 0:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    image_data = part.inline_data.data
                    mime_type = part.inline_data.mime_type
                    base64_image = base64.b64encode(image_data).decode('utf-8')
                    data_url = f"data:{mime_type};base64,{base64_image}"
                    logger.info("Final saree design generated successfully")
                    return {
                        "imageUrl": data_url,
                        "sareeState": request.sareeState
                    }

        logger.error("No image generated")
        return {
            "imageUrl": "https://placehold.co/1792x1024/4A0404/FFD700?text=Your+Custom+Saree+Design",
            "sareeState": request.sareeState,
            "error": "Generation service unavailable"
        }

    except Exception as e:
        logger.error(f"Error finalizing design: {str(e)}")
        # Return placeholder on error
        return {
            "imageUrl": "https://placehold.co/1792x1024/4A0404/FFD700?text=Your+Custom+Saree+Design",
            "sareeState": request.sareeState,
            "error": str(e)
        }

@api_router.post("/generate-saree-preview")
async def generate_saree_preview(request: SareePreviewRequest):
    """
    Generate a saree preview image based on current customization state.
    Called each time user applies a design to update the preview.
    Accepts reference images for body, border, and pallu patterns.
    """
    try:
        # Initialize Google GenAI client
        client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))

        logger.info(f"Generating saree preview with {len(request.images)} reference images...")

        # Build multimodal content with images and text
        content_parts = []

        # Add reference images with labels
        if request.images:
            if request.images.get('border'):
                border_data = request.images['border']
                if border_data.startswith('data:'):
                    # Extract base64 data from data URL
                    parts = border_data.split(',', 1)
                    if len(parts) == 2:
                        mime_match = parts[0].split(':')[1].split(';')[0] if ':' in parts[0] else 'image/png'
                        image_bytes = base64.b64decode(parts[1])
                        content_parts.append("Border design reference image:")
                        content_parts.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_match))

            if request.images.get('body'):
                body_data = request.images['body']
                if body_data.startswith('data:'):
                    parts = body_data.split(',', 1)
                    if len(parts) == 2:
                        mime_match = parts[0].split(':')[1].split(';')[0] if ':' in parts[0] else 'image/png'
                        image_bytes = base64.b64decode(parts[1])
                        content_parts.append("Body pattern reference image:")
                        content_parts.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_match))

            if request.images.get('pallu'):
                pallu_data = request.images['pallu']
                if pallu_data.startswith('data:'):
                    parts = pallu_data.split(',', 1)
                    if len(parts) == 2:
                        mime_match = parts[0].split(':')[1].split(';')[0] if ':' in parts[0] else 'image/png'
                        image_bytes = base64.b64decode(parts[1])
                        content_parts.append("Pallu design reference image:")
                        content_parts.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_match))

        # Add the text prompt
        content_parts.append(request.prompt)

        logger.info(f"Sending {len(content_parts)} content parts to Gemini")

        # Generate image using Gemini 2.0 Flash with multimodal input
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp-image-generation',
            contents=content_parts,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']
            )
        )

        # Extract image from response
        if response.candidates and len(response.candidates) > 0:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    image_data = part.inline_data.data
                    mime_type = part.inline_data.mime_type
                    base64_image = base64.b64encode(image_data).decode('utf-8')
                    data_url = f"data:{mime_type};base64,{base64_image}"
                    logger.info("Saree preview generated successfully")
                    return {
                        "imageUrl": data_url,
                        "sareeState": request.sareeState
                    }

        logger.error("No image generated for preview")
        return {
            "imageUrl": None,
            "sareeState": request.sareeState,
            "error": "Generation service unavailable"
        }

    except Exception as e:
        logger.error(f"Error generating saree preview: {str(e)}")
        return {
            "imageUrl": None,
            "sareeState": request.sareeState,
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