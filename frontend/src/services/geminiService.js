import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google GenAI client with API key from environment
const getClient = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('REACT_APP_GOOGLE_API_KEY is not set');
    throw new Error('Google API key is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
};

const MODEL = 'gemini-2.0-flash-exp';

/**
 * Generate multiple motifs for a saree section
 * @param {string} prompt - The generation prompt
 * @param {number} count - Number of motifs to generate (default: 4)
 * @param {string} section - Saree section (body/border/pallu)
 * @param {string} keyword - Design keyword
 * @returns {Promise<{motifs: string[], section: string, keyword: string}>}
 */
export const generateMotifs = async (prompt, count = 4, section, keyword) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL });
    const motifs = [];

    for (let i = 0; i < count; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // For now, return placeholder images since text-only model doesn't generate images
        // In production, you would use Imagen or similar API
        motifs.push(`https://placehold.co/400x400/8B0000/FFD700?text=Motif+${i + 1}`);
        console.log(`Generated motif ${i + 1}/${count}`);
      } catch (error) {
        console.error(`Error generating motif ${i + 1}:`, error);
        motifs.push(`https://placehold.co/400x400/8B0000/FFD700?text=Motif+${i + 1}`);
      }
    }

    console.log(`Generated ${motifs.length} motifs for ${section} with keyword: ${keyword}`);
    return { motifs, section, keyword };
  } catch (error) {
    console.error('Error in generateMotifs:', error);
    // Return placeholder images on error
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
export const generateSareePreview = async (prompt, sareeState, images = {}) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    console.log(`Generating saree preview with ${Object.keys(images).length} reference images...`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Return placeholder for now
    console.log('Saree preview generated successfully');
    return {
      imageUrl: 'https://placehold.co/1024x1024/C62828/FFD700?text=Preview+Unavailable',
      sareeState
    };
  } catch (error) {
    console.error('Error in generateSareePreview:', error);
    return {
      imageUrl: 'https://placehold.co/1024x1024/C62828/FFD700?text=Preview+Unavailable',
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
export const finalizeDesign = async (prompt, sareeState) => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    console.log(`Generating final saree design with prompt: ${prompt.substring(0, 100)}...`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Return placeholder for now
    console.log('Final saree design generated successfully');
    return {
      imageUrl: 'https://placehold.co/1792x1024/4A0404/FFD700?text=Your+Custom+Saree+Design',
      sareeState
    };
  } catch (error) {
    console.error('Error in finalizeDesign:', error);
    return {
      imageUrl: 'https://placehold.co/1792x1024/4A0404/FFD700?text=Your+Custom+Saree+Design',
      sareeState,
      error: error.message
    };
  }
};

/**
 * Helper to convert base64 data URL to bytes for Gemini API
 * @param {string} dataUrl - Base64 data URL
 * @returns {Promise<{data: Uint8Array, mimeType: string}|null>}
 */
const base64ToBytes = async (dataUrl) => {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return null;
  }

  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return null;

    const mimeType = parts[0].split(':')[1].split(';')[0] || 'image/png';
    const base64Data = parts[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return { data: bytes, mimeType };
  } catch (error) {
    console.error('Error converting base64 to bytes:', error);
    return null;
  }
};
