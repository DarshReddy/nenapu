import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import SilkColorPalette from './SilkColorPalette';
import DesignAccordion from './DesignAccordion';
import FinalizeModal from './FinalizeModal';

const ZARI_TYPES = [
  { name: 'Gold', color: '#FFD700', description: 'Traditional 22K look' },
  { name: 'Silver', color: '#E8E8E8', description: 'Elegant platinum finish' },
  { name: 'Copper', color: '#CD7F32', description: 'Warm rose gold tone' },
];

export const ControlPanel = ({ sareeState, sareePreviewUrl, updatePart, updateZari, applyColors, applyDesign, finalizeDesign, isGenerating }) => {
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState(null);

  const handleFinalizeDesign = async () => {
    if (!sareePreviewUrl) {
      toast.error('No design to finalize', {
        description: 'Please apply at least one design to your saree first',
      });
      return;
    }
    
    // Generate high-quality final image
    const finalUrl = await finalizeDesign();
    if (finalUrl) {
      setFinalImageUrl(finalUrl);
      setShowFinalizeModal(true);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-primary">
          Craft Your Masterpiece
        </h2>
        <p className="text-muted-foreground text-lg">
          Select colors, generate AI designs, and apply them to your saree
        </p>
      </div>

      {/* Finalize Design Button */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-primary/20 to-secondary/20 rounded-xl blur-xl"></div>
        <Button
          onClick={handleFinalizeDesign}
          disabled={isGenerating || !sareePreviewUrl}
          className="relative w-full bg-gradient-to-r from-primary via-primary-hover to-primary text-primary-foreground shadow-elevated hover:shadow-gold transition-all duration-500 hover:scale-[1.02]"
          size="lg"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Finalize & Download
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          {sareePreviewUrl ? 'Download or share your custom saree design' : 'Apply designs to enable finalization'}
        </p>
      </div>

      {/* Signature Silk Palette */}
      <SilkColorPalette
        sareeState={sareeState}
        applyColors={applyColors}
        isGenerating={isGenerating}
      />

      {/* Global Zari Selection */}
      <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 to-accent/10">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <Label className="text-lg font-semibold text-primary">Zari Work</Label>
            <p className="text-sm text-muted-foreground">Choose the metallic thread for your entire saree</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ZARI_TYPES.map((zari) => (
              <button
                key={zari.name}
                onClick={() => {
                  updateZari(zari.name);
                  toast.success(`${zari.name} zari selected`, {
                    description: zari.description,
                  });
                }}
                className={
                  sareeState.zari === zari.name
                    ? 'p-4 rounded-lg border-2 shadow-md transition-all bg-white/50'
                    : 'p-4 rounded-lg border border-border hover:border-secondary/50 transition-all bg-white/30'
                }
                style={{ borderColor: sareeState.zari === zari.name ? zari.color : undefined }}
              >
                <div className="w-10 h-10 rounded-full mx-auto mb-2 shadow-sm" style={{ backgroundColor: zari.color }}></div>
                <p className="text-sm font-semibold text-center">{zari.name}</p>
                <p className="text-xs text-muted-foreground text-center">{zari.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Design Accordions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Design Sections</h3>
        <p className="text-sm text-muted-foreground">
          Search for designs using AI, then click "Apply to Saree" to update the preview
        </p>
        <DesignAccordion
          sareeState={sareeState}
          updatePart={updatePart}
          applyDesign={applyDesign}
          isGenerating={isGenerating}
        />
      </div>

      {/* Finalize Modal */}
      <FinalizeModal
        isOpen={showFinalizeModal}
        onClose={() => {
          setShowFinalizeModal(false);
          setFinalImageUrl(null);
        }}
        sareeState={sareeState}
        sareePreviewUrl={finalImageUrl || sareePreviewUrl}
      />
    </div>
  );
};

export default ControlPanel;
