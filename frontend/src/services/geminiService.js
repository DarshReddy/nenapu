/**
 * Gemini AI Service Layer for Saree Image Generation
 *
 * ARCHITECTURE:
 * - Uses Google Gemini API (@google/generative-ai package)
 * - Native image generation via "nano banana" models
 * - Two-tier model strategy:
 *   1. PREVIEW Model (gemini-2.5-flash-image): Fast live preview updates
 *   2. FINAL Model (gemini-3-pro-image-preview): High-quality final generation
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
const PREVIEW_MODEL = 'gemini-2.5-flash-image';  // Fast model for live previews (nano banana)
const FINAL_MODEL = 'gemini-3-pro-image-preview';  // Best quality for final generation (nano banana pro)

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
- Aspect ratio: EXACTLY 5:1 (horizontal/landscape orientation)
- The saree must be fully unfolded and laid out horizontally showing its complete 5-6 meter length
- Layout: Border on left edge → Body (main fabric area) in center → Pallu (decorative end) on right
- White/cream background, studio lighting, high-resolution textile photography
- Show fabric texture, weave patterns, and zari work detail
- Maintain traditional Kanjeevaram silk saree proportions and structure
- Keep the saree perfectly flat and wrinkle-free`;

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

INITIAL DESIGN (Simple Color Scheme):
- BODY (main central area): Plain solid ${bodyColor} colored silk fabric
- BORDER (edge detailing): Plain solid ${borderColor} colored borders running full length
- PALLU (decorative end on right): Plain solid ${palluColor} colored pallu section
- ZARI WORK: ${zari} zari thread accents along borders and pallu edge

Keep this simple and elegant - just the color blocks in proper saree layout.
Focus on showing the traditional 5:1 horizontal layout clearly with these three color sections.`;

  return generateSareePreview(initialPrompt, sareeState, {});
};

/**
 * Generate multiple motifs for a saree section
 * @param {string} prompt - The generation prompt
 * @param {number} count - Number of motifs to generate (default: 4)
 * @param {string} section - Saree section (body/border/pallu)
 * @param {string} keyword - Design keyword
 * @returns {Promise<{motifs: string[], section: string, keyword: string}>}
 */
/**
 * Generate multiple motifs for a saree section
 * Uses fast model with detailed prompts for design generation
 */
export const generateMotifs = async (prompt, count = 4, section, keyword) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: PREVIEW_MODEL,
      generationConfig: IMAGE_GEN_CONFIG
    });
    const motifs = [];

    // Enhanced prompt for better motif generation
    const enhancedPrompt = `${prompt}

IMPORTANT: Generate a single, high-resolution design motif suitable for Kanjeevaram silk saree ${section}.
- Square aspect ratio (1:1)
- Intricate traditional South Indian textile design
- Rich detail suitable for silk weaving
- Should be seamless/tileable if used as a repeating pattern
- High contrast for visibility on silk fabric`;

    for (let i = 0; i < count; i++) {
      try {
        console.log(`🎨 Generating motif ${i + 1}/${count} for ${section}...`);
        const result = await model.generateContent(enhancedPrompt);
        const response = result.response;

        // Extract image from native image generation response
        const imageUrl = extractImageFromResponse(response);

        if (imageUrl) {
          motifs.push(imageUrl);
          console.log(`✅ Generated motif ${i + 1}/${count} for ${section}`);
        } else {
          console.warn(`⚠️ No image in response for motif ${i + 1}, using placeholder`);
          motifs.push(`https://placehold.co/400x400/8B0000/FFD700?text=${encodeURIComponent(keyword)}+${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error generating motif ${i + 1}:`, error);
        motifs.push(`https://placehold.co/400x400/8B0000/FFD700?text=Motif+${i + 1}`);
      }
    }

    console.log(`✅ Generated ${motifs.length} motifs for ${section} with keyword: ${keyword}`);
    return { motifs, section, keyword };
  } catch (error) {
    console.error('❌ Error in generateMotifs:', error);
    const placeholders = [];
    for (let i = 0; i < count; i++) {
      placeholders.push(`https://placehold.co/400x400/8B0000/FFD700?text=Motif+${i + 1}`);
    }
    return { motifs: placeholders, section, keyword, error: error.message };
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
    console.log('🚀 [PREVIEW] Starting generation with nano banana model...');
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
 * @returns {Promise<{imageUrl: string, sareeState: object}>}
 */
/**
 * Generate FINAL high-quality saree design visualization
 * Uses BEST QUALITY model for stunning final output
 * @param {string} customPrompt - Optional custom prompt
 * @param {object} sareeState - Current saree customization state
 */
export const finalizeDesign = async (customPrompt, sareeState) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: FINAL_MODEL,
      generationConfig: IMAGE_GEN_CONFIG
    });

    console.log('🚀 [FINAL] Generating saree design with nano banana pro model...');

    const bodyDesc = generateDesignDescription('body', sareeState.body.color, sareeState.body.pattern, sareeState.body.motifUrl);
    const borderDesc = generateDesignDescription('border', sareeState.border.color, sareeState.border.pattern, sareeState.border.motifUrl);
    const palluDesc = generateDesignDescription('pallu', sareeState.pallu.color, sareeState.pallu.pattern, sareeState.pallu.motifUrl);

    const finalPrompt = `${SAREE_BASE_PROMPT}

FINAL MASTERPIECE SPECIFICATIONS:
- BODY (main central area): ${bodyDesc}
- BORDER (edge detailing): ${borderDesc}  
- PALLU (decorative end): ${palluDesc}
- ZARI WORK: ${sareeState.zari} zari threading with premium shine

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

    console.log('📤 [FINAL] Sending prompt to Gemini API...');
    const result = await model.generateContent(finalPrompt);
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
