/**
 * Gemini AI Service Layer for Saree Image Generation
 *
 * ARCHITECTURE:
 * - Uses Google Gemini API (@google/generative-ai package)
 * - Native image generation via "nano banana pro" model
 * - Uses gemini-3-pro-image-preview for all image generation requests
 *
 * KEY FEATURES:
 * - Native image generation with responseModalities: ['Text', 'Image']
 * - Consistent 5:1 horizontal aspect ratio for all saree images
 * - Multimodal support: Passes selected design images as context
 * - Detailed prompt engineering for professional textile photography
 * - Automatic preview regeneration on color/design changes
 * - Graceful fallbacks with placeholders
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google GenAI client with API key from environment
const getClient = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('❌ REACT_APP_GOOGLE_API_KEY is not set in .env file!');
    throw new Error('Google API key is not configured');
  }
  console.log('✅ API Key found, length:', apiKey.length);
  return new GoogleGenerativeAI(apiKey);
};

// Models: Native image generation models (aka "nano banana")
// Using nano banana pro for all requests for best quality
const PREVIEW_MODEL = 'gemini-3-pro-image-preview';  // nano banana pro
const FINAL_MODEL = 'gemini-3-pro-image-preview';    // nano banana pro

/**
 * Generation config for image output
 * responseModalities enables native image generation
 */
const IMAGE_GEN_CONFIG = {
  responseModalities: ['Text', 'Image'],
};

/**
 * Helper to extract image data URL from Gemini response parts
 * Native image generation returns images in response.candidates[].content.parts[]
 */
const extractImageFromResponse = (response) => {
  try {
    const candidates = response.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const { mimeType, data } = part.inlineData;
          return `data:${mimeType};base64,${data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting image from response:', error);
    return null;
  }
};

/**
 * Base prompt template for consistent 5:1 horizontal saree generation
 */
const SAREE_BASE_PROMPT = `Create a professional product photography of a traditional Kanjeevaram silk saree displayed in a full flat lay arrangement on a pure white background.

CRITICAL REQUIREMENTS:
- Aspect ratio: EXACTLY 5:1 (horizontal / landscape orientation)
- The saree must be fully unfolded and laid out horizontally showing its complete 5.5 - 6 meter length
- Saree height (width): approximately 48 inches, consistent with real-world saree dimensions
- White/cream background, studio lighting, high-resolution textile photography
- Maintain traditional Kanjeevaram silk saree proportions and structure
- Keep the saree perfectly flat and wrinkle-free

LAYOUT & ADJUSTABLE PROPORTIONS:
- The saree consists of a continuous body section and a pallu section on the far right
- Borders frame the saree on ALL FOUR SIDES and must remain continuous and proportional

BORDER PLACEMENT & ORIENTATION (CRITICAL - DO NOT MISINTERPRET):
- Borders run along:
  - TOP and BOTTOM long edges for the entire length of the saree, including the pallu
  - LEFT and RIGHT short edges, forming a complete woven frame
- Long-edge borders (top & bottom) run uninterrupted from body into pallu
- Short-edge borders (left & right) must have their motifs oriented INWARD, facing the body fabric
- Border motifs must never face outward, upside-down, or away from the body
- Borders must not appear as pasted bands or decorative trims

BORDER AUTHENTICITY:
- Borders must be visibly woven into the saree structure, not stitched, printed, or overlaid
- Border width is VARIABLE and must scale realistically based on the provided border size
- Texture should appear thicker and structurally firmer than the body fabric
- Zari in borders must appear as metallic threads interwoven with silk, with depth and sheen

TEXTURE & MATERIAL REALISM:
- Show natural silk grain, weave patterns, and depth consistent with pure Kanjeevaram silk
- Zari work must have realistic metallic reflectivity and dimensionality
- Avoid any appearance of printed, flat, or digitally pasted textures`;

/**
 * Generate design description based on what's selected
 */
const generateDesignDescription = (section, color, pattern, motifUrl) => {
  if (motifUrl && pattern) {
    return `${section} with ${pattern} pattern in ${color} color`;
  }
  return `plain ${color} colored ${section}`;
};

/**
 * Generate initial saree preview with just colors (when app first loads)
 * Uses FAST model for quick initial render
 */
export const generateInitialPreview = async (sareeState) => {
  const bodyColor = sareeState.body.color;
  const borderColor = sareeState.border.color;
  const palluColor = sareeState.pallu.color;
  const zari = sareeState.zari;

  console.log('🎨 Generating initial preview with colors:', { bodyColor, borderColor, palluColor, zari });

  const initialPrompt = `${SAREE_BASE_PROMPT}

INITIAL DESIGN (BASE SAREE SETUP - DO NOT OVERDESIGN):
- BODY (main central area): Plain Kanjeevaram silk body in exact color ${bodyColor}; show natural silk weave and grain with realistic texture.
- BORDER (all four sides):
  - Woven border in exact color ${borderColor}, approximately 2 inches wide
  - Borders run continuously along top, bottom, left, and right edges
  - Zari threads interwoven within the border using ${zari} metallic threads, with realistic sheen and depth
- PALLU (decorative end on the far right):
  - Solid silk pallu in exact color ${palluColor}
  - Traditional linear zari lines across the pallu using ${zari} metallic threads
  - Zari lines must appear woven into silk, never printed or pasted

EXACT COLORS (HEX):
- BODY: ${bodyColor}
- BORDER: ${borderColor}
- PALLU: ${palluColor}
- ZARI THREAD: ${zari}

ZARI WORK:
- Zari must appear metallic, reflective, and woven into the fabric structure
- Keep zari usage elegant and authentic to traditional Kanjeevaram weaving

IMPORTANT:
- Keep the design simple and elegant
- Focus on realistic silk texture, correct proportions, and authentic woven appearance
- Do NOT introduce motifs, heavy patterns, or modern elements
- Maintain the same physical saree, only applying these base colors and zari details`;

  return generateSareePreview(initialPrompt, sareeState, {});
};

/**
 * Generate border motifs for a saree
 * @param {string} keyword - Design keyword
 * @param {string} borderCategory - Border type (Temple, Floral, Geometric, etc.)
 * @param {string} borderSize - Border size (Small, Medium, Large)
 * @param {number} borderSizeInches - Border width in inches
 * @param {string} zariType - Zari type (Gold, Silver, Copper)
 * @param {number} count - Number of motifs to generate (default: 4)
 */
export const generateBorderMotifs = async (keyword, borderCategory, borderSize, borderSizeInches, zariType, count = 4) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: PREVIEW_MODEL,
      generationConfig: IMAGE_GEN_CONFIG
    });
    const motifs = [];

    const enhancedPrompt = `Generate ONE high-resolution border design motif for a traditional Kanjeevaram silk saree.

DESIGN SPECIFICATION:
- Keyword/theme: ${keyword}
- Border category: ${borderCategory}
- Border width: ${borderSize} (${borderSizeInches} inches)
- Zari type: ${zariType}

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

    for (let i = 0; i < count; i++) {
      try {
        console.log(`🎨 Generating border motif ${i + 1}/${count}...`);
        const result = await model.generateContent(enhancedPrompt);
        const response = result.response;

        // Extract image from native image generation response
        const imageUrl = extractImageFromResponse(response);

        if (imageUrl) {
          motifs.push(imageUrl);
          console.log(`✅ Generated border motif ${i + 1}/${count}`);
        } else {
          console.warn(`⚠️ No image in response for motif ${i + 1}, using placeholder`);
          motifs.push(`https://placehold.co/800x200/8B0000/FFD700?text=${encodeURIComponent(keyword)}+${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error generating motif ${i + 1}:`, error);
        motifs.push(`https://placehold.co/800x200/8B0000/FFD700?text=Border+${i + 1}`);
      }
    }

    console.log(`✅ Generated ${motifs.length} border motifs with keyword: ${keyword}`);
    return { motifs, section: 'border', keyword };
  } catch (error) {
    console.error('❌ Error in generateBorderMotifs:', error);
    const placeholders = [];
    for (let i = 0; i < count; i++) {
      placeholders.push(`https://placehold.co/800x200/8B0000/FFD700?text=Border+${i + 1}`);
    }
    return { motifs: placeholders, section: 'border', keyword, error: error.message };
  }
};

/**
 * Generate body pattern motifs for a saree
 * @param {string} keyword - Design keyword
 * @param {string} bodyCategory - Body pattern type (Plain, Butta, Checks, etc.)
 * @param {string} zariLevel - Zari intensity (Light, Medium, Heavy)
 * @param {number} count - Number of motifs to generate (default: 4)
 */
export const generateBodyMotifs = async (keyword, bodyCategory, zariLevel, count = 4) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: PREVIEW_MODEL,
      generationConfig: IMAGE_GEN_CONFIG
    });
    const motifs = [];

    const enhancedPrompt = `Generate ONE high-resolution body pattern motif for a traditional Kanjeevaram silk saree.

DESIGN SPECIFICATION:
- Keyword/theme: ${keyword}
- Body category: ${bodyCategory}
- Zari level: ${zariLevel}

REQUIREMENTS:
- Square aspect ratio (1:1)
- Seamless and repeatable pattern for tiling across saree body
- Traditional South Indian handloom aesthetic
- Woven into silk fabric appearance (not printed)
- Zari usage matches the specified level (${zariLevel})
- High contrast and detail suitable for real silk weaving

STYLE:
- No embroidery appearance
- No artificial shine
- No modern motifs unless explicitly specified

OUTPUT: Generate exactly ONE body pattern image.`;

    for (let i = 0; i < count; i++) {
      try {
        console.log(`🎨 Generating body pattern ${i + 1}/${count}...`);
        const result = await model.generateContent(enhancedPrompt);
        const response = result.response;

        const imageUrl = extractImageFromResponse(response);

        if (imageUrl) {
          motifs.push(imageUrl);
          console.log(`✅ Generated body pattern ${i + 1}/${count}`);
        } else {
          console.warn(`⚠️ No image in response for pattern ${i + 1}, using placeholder`);
          motifs.push(`https://placehold.co/400x400/8B0000/FFD700?text=${encodeURIComponent(keyword)}+${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error generating pattern ${i + 1}:`, error);
        motifs.push(`https://placehold.co/400x400/8B0000/FFD700?text=Body+${i + 1}`);
      }
    }

    console.log(`✅ Generated ${motifs.length} body patterns with keyword: ${keyword}`);
    return { motifs, section: 'body', keyword };
  } catch (error) {
    console.error('❌ Error in generateBodyMotifs:', error);
    const placeholders = [];
    for (let i = 0; i < count; i++) {
      placeholders.push(`https://placehold.co/400x400/8B0000/FFD700?text=Body+${i + 1}`);
    }
    return { motifs: placeholders, section: 'body', keyword, error: error.message };
  }
};

/**
 * Generate pallu design motifs for a saree
 * @param {string} keyword - Design keyword
 * @param {string} palluCategory - Pallu type (Grand, Temple, Mythical, etc.)
 * @param {string} zariLevel - Zari intensity (Light, Medium, Heavy)
 * @param {number} count - Number of motifs to generate (default: 4)
 */
export const generatePalluMotifs = async (keyword, palluCategory, zariLevel, count = 4) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: PREVIEW_MODEL,
      generationConfig: IMAGE_GEN_CONFIG
    });
    const motifs = [];

    const enhancedPrompt = `Generate ONE high-resolution pallu design motif for a traditional Kanjeevaram silk saree.

DESIGN SPECIFICATION:
- Keyword/theme: ${keyword}
- Pallu category: ${palluCategory}
- Zari level: ${zariLevel}

REQUIREMENTS:
- Horizontal rectangle aspect ratio (wide)
- Grand and ornate design for the saree's decorative end
- Traditional South Indian handloom aesthetic
- Woven, layered appearance (not printed or flat)
- Heavier and richer than typical body patterns
- Dense zari work matching the specified level (${zariLevel})
- High detail suitable for heirloom silk weaving

STYLE:
- No flat illustrations
- No printed look
- No minimalism for high-zari categories

OUTPUT: Generate exactly ONE pallu design image.`;

    for (let i = 0; i < count; i++) {
      try {
        console.log(`🎨 Generating pallu design ${i + 1}/${count}...`);
        const result = await model.generateContent(enhancedPrompt);
        const response = result.response;

        const imageUrl = extractImageFromResponse(response);

        if (imageUrl) {
          motifs.push(imageUrl);
          console.log(`✅ Generated pallu design ${i + 1}/${count}`);
        } else {
          console.warn(`⚠️ No image in response for design ${i + 1}, using placeholder`);
          motifs.push(`https://placehold.co/800x400/8B0000/FFD700?text=${encodeURIComponent(keyword)}+${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error generating design ${i + 1}:`, error);
        motifs.push(`https://placehold.co/800x400/8B0000/FFD700?text=Pallu+${i + 1}`);
      }
    }

    console.log(`✅ Generated ${motifs.length} pallu designs with keyword: ${keyword}`);
    return { motifs, section: 'pallu', keyword };
  } catch (error) {
    console.error('❌ Error in generatePalluMotifs:', error);
    const placeholders = [];
    for (let i = 0; i < count; i++) {
      placeholders.push(`https://placehold.co/800x400/8B0000/FFD700?text=Pallu+${i + 1}`);
    }
    return { motifs: placeholders, section: 'pallu', keyword, error: error.message };
  }
};

/**
 * Generate saree preview with current customization state
 * @param {string} prompt - The generation prompt
 * @param {object} sareeState - Current saree customization state
 * @param {object} images - Reference images {body?, border?, pallu?}
 * @returns {Promise<{imageUrl: string, sareeState: object}>}
 */
/**
 * Generate saree preview with current customization state
 * Uses FAST model for quick live preview updates
 * @param {string} customPrompt - Optional custom prompt (if not provided, auto-generates)
 * @param {object} sareeState - Current saree customization state
 * @param {object} images - Reference images {body?, border?, pallu?} as base64 data URLs
 */
export const generateSareePreview = async (customPrompt, sareeState, images = {}) => {
  try {
    console.log('🚀 [PREVIEW] Starting generation with nano banana pro model...');
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: PREVIEW_MODEL,
      generationConfig: IMAGE_GEN_CONFIG
    });

    console.log(`📊 [PREVIEW] Reference images: ${Object.keys(images).length}`);

    // Build detailed, context-rich prompt
    const bodyDesc = generateDesignDescription('body', sareeState.body.color, sareeState.body.pattern, sareeState.body.motifUrl);
    const borderDesc = generateDesignDescription('border', sareeState.border.color, sareeState.border.pattern, sareeState.border.motifUrl);
    const palluDesc = generateDesignDescription('pallu', sareeState.pallu.color, sareeState.pallu.pattern, sareeState.pallu.motifUrl);

    const fullPrompt = `${SAREE_BASE_PROMPT}

SPECIFIC DESIGN DETAILS:
- BODY (main central area, ~70% of saree): ${bodyDesc}
- BORDER (left and right edges, running full length): ${borderDesc}
- PALLU (decorative end section on far right, ~15% of length): ${palluDesc}
- ZARI WORK: ${sareeState.zari} zari thread detailing throughout

${images.body ? '- Reference the provided body pattern image for the main fabric design' : ''}
${images.border ? '- Reference the provided border pattern image for edge designs' : ''}
${images.pallu ? '- Reference the provided pallu pattern image for the decorative end section' : ''}

MAINTAIN CONSISTENCY:
- Keep the exact 5:1 horizontal aspect ratio
- Body patterns should tile/repeat naturally across the main area
- Border patterns run continuously along both long edges
- Pallu design is prominently featured on the right end
- Traditional Kanjeevaram silk texture and sheen
- Professional product photography quality

${customPrompt || ''}`;

    // Build multimodal content if we have reference images
    const contentParts = [];
    
    if (images.border) {
      const borderData = await base64ToInlineData(images.border);
      if (borderData) {
        contentParts.push({ text: "Border pattern reference:" });
        contentParts.push({ inlineData: borderData });
      }
    }
    
    if (images.body) {
      const bodyData = await base64ToInlineData(images.body);
      if (bodyData) {
        contentParts.push({ text: "Body pattern reference:" });
        contentParts.push({ inlineData: bodyData });
      }
    }
    
    if (images.pallu) {
      const palluData = await base64ToInlineData(images.pallu);
      if (palluData) {
        contentParts.push({ text: "Pallu design reference:" });
        contentParts.push({ inlineData: palluData });
      }
    }
    
    contentParts.push({ text: fullPrompt });

    console.log(`📤 [PREVIEW] Sending ${contentParts.length} content parts to Gemini API...`);
    console.log('📝 [PREVIEW] Prompt length:', fullPrompt.length, 'characters');

    const result = await model.generateContent(contentParts);
    const response = result.response;

    console.log('✅ [PREVIEW] API Response received!');

    // Extract image from native image generation response
    const imageUrl = extractImageFromResponse(response);

    if (imageUrl) {
      console.log('🖼️ [PREVIEW] Image generated successfully!');
      return {
        imageUrl,
        sareeState,
        description: 'Saree preview generated'
      };
    } else {
      // Try to get text description as fallback
      let text = '';
      try {
        text = response.text();
      } catch (e) {
        // No text in response
      }
      console.warn('⚠️ [PREVIEW] No image in response, returning placeholder');
      return {
        imageUrl: `https://placehold.co/1000x200/C62828/FFD700?text=${encodeURIComponent('Preview: ' + bodyDesc.substring(0, 30))}`,
        sareeState,
        description: text || 'No image generated'
      };
    }
  } catch (error) {
    console.error('❌ [PREVIEW] Error:', error);
    console.error('❌ [PREVIEW] Error details:', error.message);
    return {
      imageUrl: 'https://placehold.co/1000x200/C62828/FFD700?text=Preview+Error',
      sareeState,
      error: error.message
    };
  }
};

/**
 * Generate final saree design visualization
 * @param {string} prompt - The generation prompt
 * @param {object} sareeState - Current saree customization state
 * @param {object} images - Reference images {body?, border?, pallu?} as base64 data URLs
 * @returns {Promise<{imageUrl: string, sareeState: object}>}
 */
/**
 * Generate FINAL high-quality saree design visualization
 * Uses BEST QUALITY model for stunning final output
 * @param {string} customPrompt - Optional custom prompt
 * @param {object} sareeState - Current saree customization state
 * @param {object} images - Reference images {body?, border?, pallu?} as base64 data URLs
 */
export const finalizeDesign = async (customPrompt, sareeState, images = {}) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: FINAL_MODEL,
      generationConfig: IMAGE_GEN_CONFIG
    });

    console.log('🚀 [FINAL] Generating saree design with nano banana pro model...');
    console.log(`📊 [FINAL] Reference images: ${Object.keys(images).length}`);

    const bodyDesc = generateDesignDescription('body', sareeState.body.color, sareeState.body.pattern, sareeState.body.motifUrl);
    const borderDesc = generateDesignDescription('border', sareeState.border.color, sareeState.border.pattern, sareeState.border.motifUrl);
    const palluDesc = generateDesignDescription('pallu', sareeState.pallu.color, sareeState.pallu.pattern, sareeState.pallu.motifUrl);

    const finalPrompt = `${SAREE_BASE_PROMPT}

FINAL MASTERPIECE SPECIFICATIONS:
- BODY (main central area): ${bodyDesc}
- BORDER (edge detailing): ${borderDesc}
- PALLU (decorative end): ${palluDesc}
- ZARI WORK: ${sareeState.zari} zari threading with premium shine

${images.body ? '- IMPORTANT: Use the provided body pattern image as the exact design for the main fabric area' : ''}
${images.border ? '- IMPORTANT: Use the provided border pattern image as the exact design for edge detailing' : ''}
${images.pallu ? '- IMPORTANT: Use the provided pallu pattern image as the exact design for the decorative end' : ''}

MAXIMUM QUALITY REQUIREMENTS:
- Ultra high-resolution professional product photography
- Perfect 5:1 horizontal aspect ratio (critical!)
- Studio lighting highlighting silk texture and sheen
- Rich color depth and fabric detail
- Traditional Kanjeevaram craftsmanship excellence
- Crisp, clear, magazine-quality final image
- Showcase the intricate weave patterns and zari work
- Maintain perfect flat lay presentation

DESIGN INTEGRATION:
${sareeState.body.pattern ? `- Body features ${sareeState.body.pattern} pattern elegantly tiled across the main area` : ''}
${sareeState.border.pattern ? `- Border showcases ${sareeState.border.pattern} running continuously along edges` : ''}
${sareeState.pallu.pattern ? `- Pallu displays ${sareeState.pallu.pattern} as the grand centerpiece on the right end` : ''}

This is the FINAL OUTPUT - make it absolutely stunning and magazine-worthy!

${customPrompt || ''}`;

    // Build multimodal content if we have reference images
    const contentParts = [];

    if (images.border) {
      const borderData = await base64ToInlineData(images.border);
      if (borderData) {
        contentParts.push({ text: "Border pattern reference (use this exact design):" });
        contentParts.push({ inlineData: borderData });
      }
    }

    if (images.body) {
      const bodyData = await base64ToInlineData(images.body);
      if (bodyData) {
        contentParts.push({ text: "Body pattern reference (use this exact design):" });
        contentParts.push({ inlineData: bodyData });
      }
    }

    if (images.pallu) {
      const palluData = await base64ToInlineData(images.pallu);
      if (palluData) {
        contentParts.push({ text: "Pallu design reference (use this exact design):" });
        contentParts.push({ inlineData: palluData });
      }
    }

    contentParts.push({ text: finalPrompt });

    console.log(`📤 [FINAL] Sending ${contentParts.length} content parts to Gemini API...`);
    const result = await model.generateContent(contentParts);
    const response = result.response;

    console.log('✅ [FINAL] API Response received!');

    // Extract image from native image generation response
    const imageUrl = extractImageFromResponse(response);

    if (imageUrl) {
      console.log('🖼️ [FINAL] High-quality image generated successfully!');
      return {
        imageUrl,
        sareeState,
        description: 'Final saree design generated'
      };
    } else {
      // Try to get text description as fallback
      let text = '';
      try {
        text = response.text();
      } catch (e) {
        // No text in response
      }
      console.warn('⚠️ [FINAL] No image in response, returning placeholder');
      return {
        imageUrl: `https://placehold.co/1500x300/4A0404/FFD700?text=${encodeURIComponent('Final Design')}`,
        sareeState,
        description: text || 'No image generated'
      };
    }
  } catch (error) {
    console.error('❌ [FINAL] Error:', error);
    console.error('❌ [FINAL] Error details:', error.message);
    return {
      imageUrl: 'https://placehold.co/1500x300/4A0404/FFD700?text=Final+Design+Error',
      sareeState,
      error: error.message
    };
  }
};

/**
 * Helper to convert base64 data URL to Gemini inlineData format
 */
const base64ToInlineData = async (dataUrl) => {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return null;
  }

  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return null;

    const mimeType = parts[0].split(':')[1].split(';')[0] || 'image/png';
    const base64Data = parts[1];

    return {
      mimeType,
      data: base64Data
    };
  } catch (error) {
    console.error('Error converting base64 to inline data:', error);
    return null;
  }
};
