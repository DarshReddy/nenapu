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

  // Get zari filter for metallic effect
  const getZariFilter = (zari) => {
    if (zari === 'Gold') return 'brightness(1.2) contrast(1.1)';
    if (zari === 'Silver') return 'brightness(1.15) contrast(1.05)';
    return 'brightness(1.1) contrast(1.08)';
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
              Live Preview
            </Badge>
          </div>
          <CardDescription className="text-base">
            Experience the artistry of Kanchipuram silk
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Visualization Area - Split Layout */}
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-border shadow-elevated bg-gradient-to-br from-muted/30 to-accent/20">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md z-10">
                <div className="relative">
                  <Loader2 className="w-20 h-20 text-secondary animate-spin" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-secondary/20 rounded-full animate-pulse"></div>
                </div>
                <p className="mt-6 text-xl font-medium text-primary">Weaving your masterpiece...</p>
                <p className="mt-2 text-sm text-muted-foreground">Crafting each thread with care</p>
              </div>
            ) : (
              <div className="h-full flex">
                {/* Main Saree Body (80% width) */}
                <div className="w-[80%] h-full flex flex-col">
                  {/* Top Border (15%) */}
                  <div 
                    className="h-[15%] relative transition-all duration-700 group"
                    style={{ 
                      backgroundColor: sareeState.border.color,
                      filter: getZariFilter(sareeState.border.zari),
                      ...(sareeState.border.motifUrl && {
                        backgroundImage: `url(${sareeState.border.motifUrl})`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '100px 100px',
                        backgroundBlendMode: 'multiply'
                      })
                    }}
                  >
                    {/* Silk grain texture */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 2px, transparent 4px)`,
                    }}></div>
                    
                    {/* Doop-Choop dual-tone effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/10 opacity-20"></div>
                    
                    {/* Zari pattern */}
                    <div className="absolute inset-0 opacity-40" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, ${sareeState.border.zari === 'Gold' ? '#FFD700' : sareeState.border.zari === 'Silver' ? '#E8E8E8' : '#CD7F32'} 0px, transparent 1px, transparent 8px)`,
                    }}></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                      <div className="text-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs font-semibold text-white drop-shadow-lg">TOP BORDER</p>
                        <Badge 
                          variant="outline" 
                          className="bg-white/30 border-white/50 text-white text-xs backdrop-blur-sm"
                        >
                          {sareeState.border.pattern}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Saree Body (70%) */}
                  <div 
                    className="h-[70%] relative transition-all duration-700 group"
                    style={{ 
                      backgroundColor: sareeState.body.color,
                      filter: getZariFilter(sareeState.body.zari),
                      ...(sareeState.body.motifUrl && {
                        backgroundImage: `url(${sareeState.body.motifUrl})`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '80px 80px',
                        backgroundBlendMode: 'multiply'
                      })
                    }}
                  >
                    {/* Silk grain texture - vertical weave */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, transparent 1px, transparent 3px)`,
                    }}></div>
                    
                    {/* Doop-Choop dual-tone silk reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15 opacity-20"></div>
                    
                    {/* Butta (motif) pattern */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `radial-gradient(circle, ${sareeState.body.zari === 'Gold' ? '#FFD700' : sareeState.body.zari === 'Silver' ? '#E8E8E8' : '#CD7F32'} 1.5px, transparent 1.5px)`,
                      backgroundSize: '30px 30px',
                      backgroundPosition: '0 0, 15px 15px'
                    }}></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                      <div className="text-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm font-semibold text-white drop-shadow-lg">SAREE BODY</p>
                        <Badge 
                          variant="outline" 
                          className="bg-white/30 border-white/50 text-white backdrop-blur-sm"
                        >
                          {sareeState.body.pattern}
                        </Badge>
                        <p className="text-xs text-white/90 drop-shadow">{sareeState.body.zari} Zari Work</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Border (15%) */}
                  <div 
                    className="h-[15%] relative transition-all duration-700 group"
                    style={{ 
                      backgroundColor: sareeState.border.color,
                      filter: getZariFilter(sareeState.border.zari)
                    }}
                  >
                    {/* Silk grain texture */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 2px, transparent 4px)`,
                    }}></div>
                    
                    {/* Doop-Choop effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/10 opacity-20"></div>
                    
                    {/* Zari pattern */}
                    <div className="absolute inset-0 opacity-40" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, ${sareeState.border.zari === 'Gold' ? '#FFD700' : sareeState.border.zari === 'Silver' ? '#E8E8E8' : '#CD7F32'} 0px, transparent 1px, transparent 8px)`,
                    }}></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                      <div className="text-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs font-semibold text-white drop-shadow-lg">BOTTOM BORDER</p>
                        <Badge 
                          variant="outline" 
                          className="bg-white/30 border-white/50 text-white text-xs backdrop-blur-sm"
                        >
                          {sareeState.border.pattern}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pallu Panel (20% width) - The Grand Artistry */}
                <div 
                  className="w-[20%] h-full relative transition-all duration-700 border-l-2 border-white/20 group"
                  style={{ 
                    backgroundColor: sareeState.pallu.color,
                    filter: getZariFilter(sareeState.pallu.zari)
                  }}
                >
                  {/* Intricate silk texture for pallu */}
                  <div className="absolute inset-0 opacity-25" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, transparent 2px, transparent 4px)`,
                  }}></div>
                  
                  {/* Enhanced Doop-Choop for pallu */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 opacity-25"></div>
                  
                  {/* Rich zari work for pallu */}
                  <div className="absolute inset-0 opacity-50" style={{
                    backgroundImage: `radial-gradient(circle, ${sareeState.pallu.zari === 'Gold' ? '#FFD700' : sareeState.pallu.zari === 'Silver' ? '#E8E8E8' : '#CD7F32'} 2px, transparent 2px)`,
                    backgroundSize: '20px 20px'
                  }}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="text-center space-y-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-bold text-white drop-shadow-lg tracking-wider">PALLU</p>
                      <Badge 
                        variant="outline" 
                        className="bg-white/30 border-white/50 text-white text-xs backdrop-blur-sm"
                      >
                        {sareeState.pallu.pattern}
                      </Badge>
                      <p className="text-xs text-white/90 drop-shadow">{sareeState.pallu.zari}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Design Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Body</p>
                <p className="text-sm font-semibold text-primary truncate">{sareeState.body.pattern}</p>
                <p className="text-xs text-muted-foreground">{sareeState.body.zari} Zari</p>
              </CardContent>
            </Card>
            <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Border</p>
                <p className="text-sm font-semibold text-primary truncate">{sareeState.border.pattern}</p>
                <p className="text-xs text-muted-foreground">{sareeState.border.zari} Zari</p>
              </CardContent>
            </Card>
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-accent/20">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Pallu</p>
                <p className="text-sm font-semibold text-primary truncate">{sareeState.pallu.pattern}</p>
                <p className="text-xs text-muted-foreground">{sareeState.pallu.zari} Zari</p>
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
                  Weaving...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Weave Saree
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