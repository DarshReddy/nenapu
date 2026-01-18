import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SilkColorPalette from './SilkColorPalette';
import DesignAccordion from './DesignAccordion';
import FinalizeModal from './FinalizeModal';

export const ControlPanel = ({ sareeState, updatePart, onGenerate }) => {
  const [isFinalizingDesign, setIsFinalizingDesign] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizedImageUrl, setFinalizedImageUrl] = useState(null);

  const handleFinalizeDesign = async () => {
    setIsFinalizingDesign(true);
    setShowFinalizeModal(true);
    setFinalizedImageUrl(null);

    try {
      // Build the master prompt
      const masterPrompt = `A professional fashion photograph of a Kanjeevaram silk saree.
Body: ${sareeState.body.color} with ${sareeState.body.pattern}.
Border: ${sareeState.border.color} with ${sareeState.border.pattern}.
Pallu: ${sareeState.pallu.color} with ${sareeState.pallu.pattern}.
All woven in ${sareeState.body.zari} zari.
Draped elegantly on a model in a palace courtyard,
South Indian luxury aesthetic,
cinematic lighting,
8k resolution,
high fashion editorial.`;

      // Call backend API
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finalize-design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: masterPrompt,
          sareeState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate final design');
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        setFinalizedImageUrl(data.imageUrl);
        toast.success('Your design is ready!', {
          description: 'Click to view your custom Kanjeevaram silk saree',
        });
      } else {
        throw new Error('No image URL received');
      }
    } catch (error) {
      console.error('Error finalizing design:', error);
      toast.error('Failed to finalize design', {
        description: 'Please try again or contact support',
      });
      setShowFinalizeModal(false);
    } finally {
      setIsFinalizingDesign(false);
    }
  };

  return (
    <div className="h-full p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-primary">
          Craft Your Masterpiece
        </h2>
        <p className="text-muted-foreground text-lg">
          Select colors, patterns, and zari work inspired by Kanchipuram tradition
        </p>
      </div>

      {/* Prominent Finalize Design Button */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-primary/20 to-secondary/20 rounded-xl blur-xl"></div>
        <Button
          onClick={handleFinalizeDesign}
          disabled={isFinalizingDesign}
          className="relative w-full bg-gradient-to-r from-primary via-primary-hover to-primary text-primary-foreground shadow-elevated hover:shadow-gold transition-all duration-500 hover:scale-[1.02]"
          size="lg"
        >
          {isFinalizingDesign ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Your Masterpiece...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Finalize Design
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Generate a professional visualization of your custom saree
        </p>
      </div>
      
      {/* Signature Silk Palette */}
      <SilkColorPalette 
        sareeState={sareeState}
        updatePart={updatePart}
      />
      
      {/* Design Accordions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Design Sections</h3>
        <DesignAccordion 
          sareeState={sareeState}
          updatePart={updatePart}
          onGenerate={onGenerate}
        />
      </div>

      {/* Finalize Modal */}
      <FinalizeModal
        isOpen={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        sareeState={sareeState}
        isGenerating={isFinalizingDesign}
        generatedImageUrl={finalizedImageUrl}
      />
    </div>
  );
};

export default ControlPanel;