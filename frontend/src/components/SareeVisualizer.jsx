import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';

export const SareeVisualizer = ({ sareeState, sareePreviewUrl, isGenerating }) => {
  return (
    <div className="w-full p-3 sm:p-4 bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="max-w-6xl mx-auto">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            Live Preview
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Zari:</span>
              <Badge variant="secondary" className="text-xs">{sareeState.zari}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Body:</span>
              <span className="font-medium">{sareeState.body.pattern || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Border:</span>
              <span className="font-medium">{sareeState.border.pattern || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Pallu:</span>
              <span className="font-medium">{sareeState.pallu.pattern || '-'}</span>
            </div>
          </div>
        </div>

        {/* Main Visualization Area - Kanchipuram saree aspect ratio (approximately 5:1) */}
        <div className="relative w-full rounded-lg overflow-hidden border border-border shadow-md bg-gradient-to-br from-muted/20 to-accent/10" style={{ aspectRatio: '5/1' }}>
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                <div>
                  <p className="text-sm font-medium text-primary">Weaving your saree...</p>
                  <p className="text-xs text-muted-foreground">Generating with AI</p>
                </div>
              </div>
            </div>
          ) : sareePreviewUrl ? (
            <img
              src={sareePreviewUrl}
              alt="Your custom Kanjeevaram saree"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Empty canvas placeholder showing saree structure */
            <div className="h-full flex">
              {/* Left Border */}
              <div
                className="w-[3%] h-full transition-colors duration-300"
                style={{ backgroundColor: sareeState.border.color }}
              />

              {/* Main Body */}
              <div className="flex-1 flex flex-col">
                {/* Top Border */}
                <div
                  className="h-[15%] transition-colors duration-300 flex items-center justify-center"
                  style={{ backgroundColor: sareeState.border.color }}
                >
                  <span className="text-[10px] text-white/60 font-medium">Border</span>
                </div>

                {/* Body */}
                <div
                  className="flex-1 transition-colors duration-300 flex items-center justify-center"
                  style={{ backgroundColor: sareeState.body.color }}
                >
                  <span className="text-xs text-white/60 font-medium">Body - Select designs below</span>
                </div>

                {/* Bottom Border */}
                <div
                  className="h-[15%] transition-colors duration-300"
                  style={{ backgroundColor: sareeState.border.color }}
                />
              </div>

              {/* Right Border */}
              <div
                className="w-[3%] h-full transition-colors duration-300"
                style={{ backgroundColor: sareeState.border.color }}
              />

              {/* Pallu Section (20% of width) */}
              <div
                className="w-[20%] h-full transition-colors duration-300 border-l-2 border-white/30 flex items-center justify-center"
                style={{ backgroundColor: sareeState.pallu.color }}
              >
                <span className="text-xs text-white/60 font-medium">Pallu</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SareeVisualizer;
