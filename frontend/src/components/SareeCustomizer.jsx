import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import Header from './Header';
import SareeVisualizer from './SareeVisualizer';
import ControlPanel from './ControlPanel';

export const SareeCustomizer = () => {
  const [sareeState, setSareeState] = useState({
    zari: 'Gold', // Global zari setting for entire saree
    body: {
      color: '#C62828',
      pattern: '',
      motifUrl: ''
    },
    border: {
      color: '#D4AF37',
      pattern: '',
      motifUrl: ''
    },
    pallu: {
      color: '#4A0404',
      pattern: '',
      motifUrl: ''
    }
  });

  const [sareePreviewUrl, setSareePreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updatePart = (part, updates) => {
    setSareeState(prev => ({
      ...prev,
      [part]: { ...prev[part], ...updates }
    }));
  };

  const updateZari = (zari) => {
    setSareeState(prev => ({ ...prev, zari }));
  };

  // Generate saree preview with current state
  const generateSareePreview = useCallback(async (updatedState) => {
    const state = updatedState || sareeState;
    setIsGenerating(true);

    try {
      // Build prompt describing current saree state
      const bodyDesc = state.body.motifUrl
        ? `body with ${state.body.pattern || 'custom'} design pattern`
        : `plain ${state.body.color} colored body`;

      const borderDesc = state.border.motifUrl
        ? `border with ${state.border.pattern || 'custom'} design pattern`
        : `plain ${state.border.color} colored border`;

      const palluDesc = state.pallu.motifUrl
        ? `pallu with ${state.pallu.pattern || 'custom'} design pattern`
        : `plain ${state.pallu.color} colored pallu`;

      const prompt = `A high-resolution flat lay photograph of a traditional Kanjeevaram silk saree displayed in full length, showing all parts clearly:
- ${bodyDesc}
- ${borderDesc}
- ${palluDesc}
All woven with ${state.zari} zari thread work.
Professional product photography, white/cream background, luxury textile, full saree visible from top to bottom, traditional South Indian silk saree proportions (approximately 5.5 meters length shown folded elegantly), high detail fabric texture.`;

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-saree-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sareeState: state })
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      if (data.imageUrl) {
        setSareePreviewUrl(data.imageUrl);
        toast.success('Saree preview updated!');
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
    await generateSareePreview(newState);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex flex-col">
        {/* Top: Sticky Saree Preview */}
        <div className="sticky top-0 z-40 w-full border-b border-border bg-background shadow-md">
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
            applyDesign={applyDesign}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default SareeCustomizer;