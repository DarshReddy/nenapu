import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const FinalizeModal = ({ isOpen, onClose, sareeState, isGenerating, generatedImageUrl }) => {
  const handleDownload = async () => {
    try {
      if (!generatedImageUrl) return;
      
      // Download the image
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `threads-of-nenapu-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Design downloaded successfully!', {
        description: 'Your custom saree design has been saved.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed', {
        description: 'Please try again or right-click to save the image.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        {isGenerating ? (
          <div className="p-12 flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-background via-accent/30 to-background">
            <div className="relative">
              <Loader2 className="w-20 h-20 text-secondary animate-spin" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-secondary/20 rounded-full animate-pulse"></div>
            </div>
            <h3 className="mt-8 text-2xl font-bold text-primary">Weaving Your Masterpiece...</h3>
            <p className="mt-3 text-muted-foreground text-center max-w-md">
              Creating a professional visualization of your custom Kanjeevaram silk saree
            </p>
            <div className="mt-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              <span className="text-sm text-muted-foreground">Applying {sareeState.body.zari} zari work...</span>
            </div>
          </div>
        ) : generatedImageUrl ? (
          <div className="relative">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-3xl font-bold text-primary mb-2">
                    Your Exquisite Saree Design
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    A masterpiece crafted with your selections
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Image Display */}
            <div className="p-6 bg-gradient-to-br from-background via-accent/20 to-background">
              <div className="relative rounded-2xl overflow-hidden shadow-elevated border-2 border-border">
                <img
                  src={generatedImageUrl}
                  alt="Finalized Saree Design"
                  className="w-full h-auto"
                />
                {/* Elegant overlay frame */}
                <div className="absolute inset-0 border-8 border-white/10 pointer-events-none"></div>
              </div>
            </div>

            {/* Design Details */}
            <div className="p-6 bg-muted/30">
              <h4 className="text-lg font-semibold text-primary mb-4">Design Specifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Body Details */}
                <div className="bg-card rounded-lg p-4 border border-border shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: sareeState.body.color }}
                    ></div>
                    <h5 className="font-semibold text-primary">Body</h5>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Pattern:</span> {sareeState.body.pattern}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Color:</span> {sareeState.body.color.toUpperCase()}
                    </p>
                    <Badge variant="outline" className="text-xs">{sareeState.body.zari} Zari</Badge>
                  </div>
                </div>

                {/* Border Details */}
                <div className="bg-card rounded-lg p-4 border border-border shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: sareeState.border.color }}
                    ></div>
                    <h5 className="font-semibold text-primary">Border</h5>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Pattern:</span> {sareeState.border.pattern}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Color:</span> {sareeState.border.color.toUpperCase()}
                    </p>
                    <Badge variant="outline" className="text-xs">{sareeState.border.zari} Zari</Badge>
                  </div>
                </div>

                {/* Pallu Details */}
                <div className="bg-card rounded-lg p-4 border border-border shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: sareeState.pallu.color }}
                    ></div>
                    <h5 className="font-semibold text-primary">Pallu</h5>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Pattern:</span> {sareeState.pallu.pattern}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Color:</span> {sareeState.pallu.color.toUpperCase()}
                    </p>
                    <Badge variant="outline" className="text-xs">{sareeState.pallu.zari} Zari</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-background border-t border-border">
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleDownload}
                  className="bg-secondary hover:bg-secondary/90 text-primary shadow-gold transition-all duration-300"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Design
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  size="lg"
                >
                  Back to Customization
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default FinalizeModal;