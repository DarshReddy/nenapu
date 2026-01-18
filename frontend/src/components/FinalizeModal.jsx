import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export const FinalizeModal = ({ isOpen, onClose, sareeState, sareePreviewUrl }) => {
  const handleDownload = async () => {
    try {
      if (!sareePreviewUrl) return;

      // Handle base64 data URLs
      if (sareePreviewUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = sareePreviewUrl;
        link.download = `threads-of-nenapu-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Handle regular URLs
        const response = await fetch(sareePreviewUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `threads-of-nenapu-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

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

  const handleShare = async () => {
    try {
      if (navigator.share && sareePreviewUrl) {
        // For base64, we need to convert to blob first
        let blob;
        if (sareePreviewUrl.startsWith('data:')) {
          const res = await fetch(sareePreviewUrl);
          blob = await res.blob();
        } else {
          const res = await fetch(sareePreviewUrl);
          blob = await res.blob();
        }

        const file = new File([blob], 'threads-of-nenapu-saree.png', { type: 'image/png' });

        await navigator.share({
          title: 'My Custom Kanjeevaram Saree',
          text: 'Check out my custom saree design from Threads of Nenapu!',
          files: [file]
        });
      } else {
        // Fallback: copy to clipboard or show message
        toast.info('Share feature not available', {
          description: 'Please download and share manually.',
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('Share failed', {
          description: 'Please download and share manually.',
        });
      }
    }
  };

  if (!sareePreviewUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-primary mb-1">
                  Your Kanjeevaram Masterpiece
                </DialogTitle>
                <DialogDescription className="text-base">
                  Download or share your custom saree design
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
            <div className="relative rounded-2xl overflow-hidden shadow-elevated border-2 border-border bg-white">
              <img
                src={sareePreviewUrl}
                alt="Your Custom Saree Design"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Design Details */}
          <div className="p-6 bg-muted/30">
            <h4 className="text-lg font-semibold text-primary mb-4">Design Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Zari */}
              <div className="bg-card rounded-lg p-4 border border-border shadow-soft">
                <h5 className="font-semibold text-primary mb-2">Zari Work</h5>
                <Badge variant="secondary" className="text-sm">{sareeState.zari}</Badge>
              </div>

              {/* Body Details */}
              <div className="bg-card rounded-lg p-4 border border-border shadow-soft">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-border shadow-sm"
                    style={{ backgroundColor: sareeState.body.color }}
                  ></div>
                  <h5 className="font-semibold text-primary">Body</h5>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {sareeState.body.pattern || 'Not set'}
                </p>
              </div>

              {/* Border Details */}
              <div className="bg-card rounded-lg p-4 border border-border shadow-soft">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-border shadow-sm"
                    style={{ backgroundColor: sareeState.border.color }}
                  ></div>
                  <h5 className="font-semibold text-primary">Border</h5>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {sareeState.border.pattern || 'Not set'}
                </p>
              </div>

              {/* Pallu Details */}
              <div className="bg-card rounded-lg p-4 border border-border shadow-soft">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-border shadow-sm"
                    style={{ backgroundColor: sareeState.pallu.color }}
                  ></div>
                  <h5 className="font-semibold text-primary">Pallu</h5>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {sareeState.pallu.pattern || 'Not set'}
                </p>
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
                onClick={handleShare}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                size="lg"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinalizeModal;
