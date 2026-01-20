/**
 * Script to generate preset design images using Gemini API (nano banana pro)
 * Run with: node scripts/generatePresetImages.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load API key from .env
require('dotenv').config();
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

if (!API_KEY) {
  console.error('Missing REACT_APP_GOOGLE_API_KEY in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL = 'gemini-2.0-flash-exp-image-generation';

const IMAGE_GEN_CONFIG = {
  responseModalities: ['Text', 'Image'],
};

// Preset designs to generate
const BORDER_DESIGNS = [
  { name: 'temple_border', keyword: 'temple gopuram towers', category: 'Temple' },
  { name: 'peacock', keyword: 'peacock feathers', category: 'Animal' },
  { name: 'mallinaggu', keyword: 'jasmine flower buds chain', category: 'Floral' },
  { name: 'rettai_pattu', keyword: 'double silk weave pattern', category: 'Traditional' },
  { name: 'gopuram', keyword: 'temple tower spires', category: 'Temple' },
  { name: 'rudraksha', keyword: 'rudraksha beads chain', category: 'Sacred' },
];

const BODY_PATTERNS = [
  { name: 'butta_small', keyword: 'small scattered floral buttas', category: 'Buttas' },
  { name: 'vanasingaram', keyword: 'forest trees and nature', category: 'Forest' },
  { name: 'checks', keyword: 'geometric check pattern', category: 'Geometric' },
  { name: 'paisley', keyword: 'paisley mango motifs', category: 'Paisley' },
  { name: 'stripe_korvai', keyword: 'korvai stripe weave', category: 'Korvai' },
  { name: 'plain_weave', keyword: 'plain silk texture', category: 'Plain' },
];

const PALLU_DESIGNS = [
  { name: 'grand_peacock', keyword: 'grand peacock with spread feathers', category: 'Grand' },
  { name: 'mythological_scene', keyword: 'hindu mythology scene with deities', category: 'Mythical' },
  { name: 'floral_cascade', keyword: 'cascading flowers and vines', category: 'Floral' },
  { name: 'temple_architecture', keyword: 'dravidian temple architecture', category: 'Temple' },
  { name: 'geometric_mandala', keyword: 'intricate geometric mandala', category: 'Geometric' },
  { name: 'royal_elephant', keyword: 'decorated royal elephant', category: 'Animal' },
];

// Extract image from Gemini response
function extractImageFromResponse(response) {
  try {
    const candidates = response.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          return part.inlineData;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting image:', error);
    return null;
  }
}

// Generate border image
async function generateBorderImage(design) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: IMAGE_GEN_CONFIG
  });

  const prompt = `Generate ONE high-resolution border design motif for a traditional Kanjeevaram silk saree.

DESIGN SPECIFICATION:
- Keyword/theme: ${design.keyword}
- Border category: ${design.category}
- Border width: Medium (2 inches)
- Zari type: Gold

REQUIREMENTS:
- Horizontal strip aspect ratio (wide rectangle)
- Seamless/tileable repeating pattern
- Traditional South Indian handloom aesthetic
- Woven into silk fabric appearance (not printed or overlaid)
- Zari appears as metallic threads interlaced with silk
- High contrast and detail suitable for real silk weaving

STYLE:
- No modern graphics
- No embroidery look
- No flat textures

OUTPUT: Generate exactly ONE border design image.`;

  const result = await model.generateContent(prompt);
  return extractImageFromResponse(result.response);
}

// Generate body image
async function generateBodyImage(design) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: IMAGE_GEN_CONFIG
  });

  const prompt = `Generate ONE high-resolution body pattern motif for a traditional Kanjeevaram silk saree.

DESIGN SPECIFICATION:
- Keyword/theme: ${design.keyword}
- Body category: ${design.category}
- Zari level: Medium

REQUIREMENTS:
- Square aspect ratio (1:1)
- Seamless and repeatable pattern for tiling across saree body
- Traditional South Indian handloom aesthetic
- Woven into silk fabric appearance (not printed)
- Zari usage matches the specified level (Medium)
- High contrast and detail suitable for real silk weaving

STYLE:
- No embroidery appearance
- No artificial shine
- No modern motifs unless explicitly specified

OUTPUT: Generate exactly ONE body pattern image.`;

  const result = await model.generateContent(prompt);
  return extractImageFromResponse(result.response);
}

// Generate pallu image
async function generatePalluImage(design) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: IMAGE_GEN_CONFIG
  });

  const prompt = `Generate ONE high-resolution pallu design motif for a traditional Kanjeevaram silk saree.

DESIGN SPECIFICATION:
- Keyword/theme: ${design.keyword}
- Pallu category: ${design.category}
- Zari level: Heavy

REQUIREMENTS:
- Horizontal rectangle aspect ratio (wide)
- Grand and ornate design for the saree's decorative end
- Traditional South Indian handloom aesthetic
- Woven, layered appearance (not printed or flat)
- Heavier and richer than typical body patterns
- Dense zari work matching the specified level (Heavy)
- High detail suitable for heirloom silk weaving

STYLE:
- No flat illustrations
- No printed look
- No minimalism for high-zari categories

OUTPUT: Generate exactly ONE pallu design image.`;

  const result = await model.generateContent(prompt);
  return extractImageFromResponse(result.response);
}

// Save image to file
function saveImage(imageData, outputPath) {
  const buffer = Buffer.from(imageData.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  Saved: ${outputPath}`);
}

// Main function
async function main() {
  const outputDir = path.join(__dirname, '../public/designs');

  // Ensure directories exist
  ['border', 'body', 'pallu'].forEach(dir => {
    const dirPath = path.join(outputDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  console.log('Generating preset images using Gemini API...\n');

  // Generate border images
  console.log('=== BORDER DESIGNS ===');
  for (const design of BORDER_DESIGNS) {
    try {
      console.log(`Generating: ${design.name}...`);
      const imageData = await generateBorderImage(design);
      if (imageData) {
        const ext = imageData.mimeType.split('/')[1] || 'png';
        saveImage(imageData, path.join(outputDir, 'border', `${design.name}.${ext}`));
      } else {
        console.log(`  Failed: No image generated for ${design.name}`);
      }
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`  Error generating ${design.name}:`, error.message);
    }
  }

  // Generate body images
  console.log('\n=== BODY PATTERNS ===');
  for (const design of BODY_PATTERNS) {
    try {
      console.log(`Generating: ${design.name}...`);
      const imageData = await generateBodyImage(design);
      if (imageData) {
        const ext = imageData.mimeType.split('/')[1] || 'png';
        saveImage(imageData, path.join(outputDir, 'body', `${design.name}.${ext}`));
      } else {
        console.log(`  Failed: No image generated for ${design.name}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`  Error generating ${design.name}:`, error.message);
    }
  }

  // Generate pallu images
  console.log('\n=== PALLU DESIGNS ===');
  for (const design of PALLU_DESIGNS) {
    try {
      console.log(`Generating: ${design.name}...`);
      const imageData = await generatePalluImage(design);
      if (imageData) {
        const ext = imageData.mimeType.split('/')[1] || 'png';
        saveImage(imageData, path.join(outputDir, 'pallu', `${design.name}.${ext}`));
      } else {
        console.log(`  Failed: No image generated for ${design.name}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`  Error generating ${design.name}:`, error.message);
    }
  }

  console.log('\nDone! Images saved to public/designs/');
}

main().catch(console.error);
