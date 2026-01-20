import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  generateSareePreview as generateSareePreviewAPI,
  finalizeDesign as finalizeDesignAPI
} from '@/services/geminiService';
import Header from './Header';
import SareeVisualizer from './SareeVisualizer';
import ControlPanel from './ControlPanel';

export const SareeCustomizer = () => {
  const [sareeState, setSareeState] = useState({
    zari: 'Gold', // Global zari setting for entire saree
    body: {
      color: '',  // Initially empty - user must select
      pattern: '',
      motifUrl: '',
      category: 'Plain',  // Body pattern category
      zariLevel: 'Medium'  // Zari intensity for body
    },
    border: {
      color: '',  // Initially empty - user must select
      pattern: '',
      motifUrl: '',
      category: 'Temple',  // Border design category
      size: 'Medium',      // Border width
      sizeInches: 2        // Border width in inches
    },
    pallu: {
      color: '',  // Initially empty - user must select
      pattern: '',
      motifUrl: '',
      category: 'Grand',   // Pallu design category
      zariLevel: 'Heavy'   // Zari intensity for pallu
    }
  });

  const [sareePreviewUrl, setSareePreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update part without triggering preview regeneration
  const updatePart = (part, updates) => {
    const newState = {
      ...sareeState,
      [part]: { ...sareeState[part], ...updates }
    };
    setSareeState(newState);
  };

  // Apply colors and generate preview (called from SilkColorPalette)
  const applyColors = async (colors) => {
    const newState = {
      ...sareeState,
      body: { ...sareeState.body, color: colors.body },
      border: { ...sareeState.border, color: colors.border },
      pallu: { ...sareeState.pallu, color: colors.pallu }
    };
    setSareeState(newState);
    await generateSareePreview(newState);
  };

  const updateZari = (zari) => {
    const newState = { ...sareeState, zari };
    setSareeState(newState);
    // Only regenerate preview if all colors are set
    if (newState.body.color && newState.border.color && newState.pallu.color) {
      generateSareePreview(newState);
    }
  };

  // Helper to convert image URL to base64
  const imageUrlToBase64 = async (url) => {
    if (!url) return null;
    // If already base64, return as-is
    if (url.startsWith('data:')) {
      return url;
    }
    // For local URLs, fetch and convert
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // Generate saree preview with current state
  const generateSareePreview = useCallback(async (updatedState) => {
    const state = updatedState || sareeState;
    setIsGenerating(true);

    try {
      // Collect images for sections that have motifs
      const images = {};

      if (state.body.motifUrl) {
        images.body = await imageUrlToBase64(state.body.motifUrl);
      }
      if (state.border.motifUrl) {
        images.border = await imageUrlToBase64(state.border.motifUrl);
      }
      if (state.pallu.motifUrl) {
        images.pallu = await imageUrlToBase64(state.pallu.motifUrl);
      }

      // Call API with null prompt to use auto-generated prompt
      const data = await generateSareePreviewAPI(null, state, images);
      
      if (data.imageUrl) {
        setSareePreviewUrl(data.imageUrl);
        toast.success('Saree preview updated!');
      } else if (data.error) {
        toast.error('Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating saree preview:', error);
      toast.error('Failed to generate preview');
    } finally {
      setIsGenerating(false);
    }
  }, [sareeState]);

  // Apply a design to a section and regenerate preview
  const applyDesign = async (section, motifUrl, patternName) => {
    const newState = {
      ...sareeState,
      [section]: {
        ...sareeState[section],
        motifUrl,
        pattern: patternName || sareeState[section].pattern
      }
    };
    setSareeState(newState);

    // Only regenerate preview if all colors are set
    if (newState.body.color && newState.border.color && newState.pallu.color) {
      await generateSareePreview(newState);
    } else {
      toast.info('Design saved!', {
        description: 'Select all colors and click Apply to see preview'
      });
    }
  };

  // Generate final high-quality design
  const handleFinalizeDesign = async () => {
    setIsGenerating(true);
    try {
      toast.info('Generating final high-quality design...', {
        description: 'This may take a moment for best results'
      });

      // Collect images for sections that have motifs (same as preview)
      const images = {};

      if (sareeState.body.motifUrl) {
        images.body = await imageUrlToBase64(sareeState.body.motifUrl);
      }
      if (sareeState.border.motifUrl) {
        images.border = await imageUrlToBase64(sareeState.border.motifUrl);
      }
      if (sareeState.pallu.motifUrl) {
        images.pallu = await imageUrlToBase64(sareeState.pallu.motifUrl);
      }

      const data = await finalizeDesignAPI(null, sareeState, images);

      if (data.imageUrl) {
        setSareePreviewUrl(data.imageUrl);
        toast.success('Final design generated!', {
          description: 'Your masterpiece is ready to download'
        });
        return data.imageUrl; // Return URL for modal
      } else {
        toast.error('Failed to generate final design');
        return null;
      }
    } catch (error) {
      console.error('Error generating final design:', error);
      toast.error('Failed to generate final design');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex flex-col">
        {/* Top: Sticky Saree Preview (below header) */}
        <div className="sticky top-20 z-40 w-full border-b border-border bg-background shadow-md">
          <SareeVisualizer
            sareeState={sareeState}
            sareePreviewUrl={sareePreviewUrl}
            isGenerating={isGenerating}
          />
        </div>

        {/* Bottom: Controls */}
        <div className="w-full bg-background">
          <ControlPanel
            sareeState={sareeState}
            sareePreviewUrl={sareePreviewUrl}
            updatePart={updatePart}
            updateZari={updateZari}
            applyColors={applyColors}
            applyDesign={applyDesign}
            finalizeDesign={handleFinalizeDesign}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default SareeCustomizer;