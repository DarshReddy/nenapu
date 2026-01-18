#!/usr/bin/env python3
"""
Script to generate example images for all saree design categories.
Images are saved to frontend/public/designs/ folder.
"""

import os
import base64
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize client
client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))

# Output directory
FRONTEND_DIR = Path(__file__).parent.parent / 'frontend' / 'public' / 'designs'

# Design categories
BORDER_DESIGNS = [
    {'name': 'Temple Border', 'type': 'Temple'},
    {'name': 'Peacock', 'type': 'Animal'},
    {'name': 'Mallinaggu', 'type': 'Floral'},
    {'name': 'Rettai Pattu', 'type': 'Traditional'},
    {'name': 'Gopuram', 'type': 'Temple'},
    {'name': 'Rudraksha', 'type': 'Sacred'},
]

BODY_PATTERNS = [
    {'name': 'Butta Small', 'type': 'Buttas'},
    {'name': 'Vanasingaram', 'type': 'Forest'},
    {'name': 'Checks', 'type': 'Geometric'},
    {'name': 'Paisley', 'type': 'Traditional'},
    {'name': 'Stripe Korvai', 'type': 'Korvai'},
    {'name': 'Plain Weave', 'type': 'Classic'},
]

PALLU_DESIGNS = [
    {'name': 'Grand Peacock', 'type': 'Grand'},
    {'name': 'Mythological Scene', 'type': 'Mythical'},
    {'name': 'Floral Cascade', 'type': 'Floral'},
    {'name': 'Temple Architecture', 'type': 'Temple'},
    {'name': 'Geometric Mandala', 'type': 'Geometric'},
    {'name': 'Royal Elephant', 'type': 'Animal'},
]


def generate_image(prompt: str, output_path: Path) -> bool:
    """Generate an image using Gemini and save it to the specified path."""
    try:
        print(f"Generating: {output_path.name}...")

        response = client.models.generate_content(
            model='gemini-2.0-flash-exp-image-generation',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']
            )
        )

        if response.candidates and len(response.candidates) > 0:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    image_data = part.inline_data.data
                    # Save as PNG
                    with open(output_path, 'wb') as f:
                        f.write(image_data)
                    print(f"  Saved: {output_path}")
                    return True

        print(f"  Failed: No image generated for {output_path.name}")
        return False

    except Exception as e:
        print(f"  Error generating {output_path.name}: {str(e)}")
        return False


def sanitize_filename(name: str) -> str:
    """Convert design name to a valid filename."""
    return name.lower().replace(' ', '_').replace('/', '_')


def generate_border_designs():
    """Generate all border design images."""
    print("\n=== Generating Border Designs ===")
    output_dir = FRONTEND_DIR / 'border'
    output_dir.mkdir(parents=True, exist_ok=True)

    for design in BORDER_DESIGNS:
        filename = f"{sanitize_filename(design['name'])}.png"
        output_path = output_dir / filename

        if output_path.exists():
            print(f"Skipping {filename} (already exists)")
            continue

        prompt = f"A single high-resolution Kanjeevaram saree border design featuring {design['name']}, {design['type']} style, traditional South Indian temple border, Gold zari work, intricate weave pattern suitable for saree edge, cream/off-white background, seamless horizontal pattern, textile design"

        generate_image(prompt, output_path)


def generate_body_patterns():
    """Generate all body pattern images."""
    print("\n=== Generating Body Patterns ===")
    output_dir = FRONTEND_DIR / 'body'
    output_dir.mkdir(parents=True, exist_ok=True)

    for design in BODY_PATTERNS:
        filename = f"{sanitize_filename(design['name'])}.png"
        output_path = output_dir / filename

        if output_path.exists():
            print(f"Skipping {filename} (already exists)")
            continue

        prompt = f"A single high-resolution Kanjeevaram saree body pattern featuring {design['name']}, {design['type']} style, traditional South Indian textile design, Gold zari accents, repeating butta pattern for saree main fabric, cream/off-white background, seamless tileable pattern, textile design"

        generate_image(prompt, output_path)


def generate_pallu_designs():
    """Generate all pallu design images."""
    print("\n=== Generating Pallu Designs ===")
    output_dir = FRONTEND_DIR / 'pallu'
    output_dir.mkdir(parents=True, exist_ok=True)

    for design in PALLU_DESIGNS:
        filename = f"{sanitize_filename(design['name'])}.png"
        output_path = output_dir / filename

        if output_path.exists():
            print(f"Skipping {filename} (already exists)")
            continue

        prompt = f"A single high-resolution Kanjeevaram saree pallu design featuring {design['name']}, {design['type']} style, grand traditional South Indian pallu artwork, Gold zari work, elaborate and ornate design suitable for saree end piece, cream/off-white background, rich detailed pattern, textile design"

        generate_image(prompt, output_path)


def main():
    print("Starting design image generation...")
    print(f"Output directory: {FRONTEND_DIR}")

    generate_border_designs()
    generate_body_patterns()
    generate_pallu_designs()

    print("\n=== Generation Complete ===")
    print("Images saved to frontend/public/designs/")


if __name__ == '__main__':
    main()
