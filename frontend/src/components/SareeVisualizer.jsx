import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const SareeVisualizer = ({ sareeState, isGenerating, onGenerate }) => {
  const handleDownload = () => {
    toast.success('Design saved successfully!', {
      description: 'Your custom saree design has been saved to your gallery.',
    });
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-accent/30 to-background">
      <Card className="flex-1 shadow-elevated border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              Your Saree Design
            </CardTitle>
            <Badge variant="secondary" className="font-medium">
              Preview
            </Badge>
          </div>
          <CardDescription className="text-base">
            Visualize your custom creation in real-time
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Visualization Area */}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-border shadow-medium bg-gradient-to-br from-muted/30 to-accent/20">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-secondary animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-secondary/20 rounded-full animate-pulse"></div>
                </div>
                <p className="mt-6 text-lg font-medium text-primary">Weaving your design...</p>
                <p className="mt-2 text-sm text-muted-foreground">This may take a moment</p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Saree Parts Visualization */}
                <div className="h-full flex flex-col">
                  {/* Pallu (Top) */}
                  <div 
                    className="h-[25%] relative transition-all duration-500 hover:shadow-inner"
                    style={{ backgroundColor: sareeState.pallu.color }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="text-center space-y-1 p-4">
                        <p className="text-xs font-semibold text-white/90 drop-shadow-lg">PALLU</p>
                        <Badge 
                          variant="outline" 
                          className="bg-white/20 border-white/40 text-white text-xs backdrop-blur-sm"
                        >
                          {sareeState.pallu.pattern}
                        </Badge>
                        <p className="text-xs text-white/80">{sareeState.pallu.zari} Zari</p>
                      </div>
                    </div>
                    {/* Zari dots pattern */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `radial-gradient(circle, ${sareeState.pallu.zari === 'Gold' ? '#FFD700' : sareeState.pallu.zari === 'Silver' ? '#C0C0C0' : '#B87333'} 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                  
                  {/* Body (Middle) */}
                  <div 
                    className="h-[58%] relative transition-all duration-500 hover:shadow-inner"
                    style={{ backgroundColor: sareeState.body.color }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                      <div className="text-center space-y-2 p-4">
                        <p className="text-sm font-semibold text-white/90 drop-shadow-lg">BODY</p>
                        <Badge 
                          variant="outline" 
                          className="bg-white/20 border-white/40 text-white backdrop-blur-sm"
                        >
                          {sareeState.body.pattern}
                        </Badge>
                        <p className="text-xs text-white/80">{sareeState.body.zari} Zari Work</p>
                      </div>
                    </div>
                    {/* Silk texture pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `linear-gradient(45deg, transparent 48%, white 48%, white 52%, transparent 52%)`,
                      backgroundSize: '4px 4px'
                    }}></div>
                  </div>
                  
                  {/* Border (Bottom) */}
                  <div 
                    className="h-[17%] relative transition-all duration-500 hover:shadow-inner"
                    style={{ backgroundColor: sareeState.border.color }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="text-center space-y-1 p-2">
                        <p className="text-xs font-semibold text-white/90 drop-shadow-lg">BORDER</p>
                        <Badge 
                          variant="outline" 
                          className="bg-white/20 border-white/40 text-white text-xs backdrop-blur-sm"
                        >
                          {sareeState.border.pattern}
                        </Badge>
                        <p className="text-xs text-white/80">{sareeState.border.zari}</p>
                      </div>
                    </div>
                    {/* Decorative border pattern */}
                    <div className="absolute inset-0 opacity-40" style={{
                      backgroundImage: `repeating-linear-gradient(90deg, ${sareeState.border.zari === 'Gold' ? '#FFD700' : sareeState.border.zari === 'Silver' ? '#C0C0C0' : '#B87333'} 0px, transparent 2px, transparent 10px, ${sareeState.border.zari === 'Gold' ? '#FFD700' : sareeState.border.zari === 'Silver' ? '#C0C0C0' : '#B87333'} 12px)`,
                    }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Design Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Body</p>
                <p className="text-sm font-semibold text-primary truncate">{sareeState.body.pattern}</p>
              </CardContent>
            </Card>
            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Border</p>
                <p className="text-sm font-semibold text-primary truncate">{sareeState.border.pattern}</p>
              </CardContent>
            </Card>
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Pallu</p>
                <p className="text-sm font-semibold text-primary truncate">{sareeState.pallu.pattern}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground shadow-medium hover:shadow-elevated transition-all duration-300"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Design
                </>
              )}
            </Button>
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary shadow-medium hover:shadow-gold transition-all duration-300"
              size="lg"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SareeVisualizer;