import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

const BORDER_DESIGNS = [
  { name: 'Temple Border', type: 'Temple', icon: '🏛️' },
  { name: 'Peacock', type: 'Animal', icon: '🦚' },
  { name: 'Mallinaggu', type: 'Floral', icon: '🌺' },
  { name: 'Rettai Pattu', type: 'Traditional', icon: '✨' },
  { name: 'Gopuram', type: 'Temple', icon: '🕉️' },
  { name: 'Rudraksha', type: 'Sacred', icon: '📿' },
];

const BODY_PATTERNS = [
  { name: 'Butta Small', type: 'Buttas', icon: '⚬' },
  { name: 'Vanasingaram', type: 'Forest', icon: '🌳' },
  { name: 'Checks', type: 'Geometric', icon: '▦' },
  { name: 'Paisley', type: 'Traditional', icon: '🪷' },
  { name: 'Stripe Korvai', type: 'Korvai', icon: '▬' },
  { name: 'Plain Weave', type: 'Classic', icon: '◼️' },
];

const PALLU_DESIGNS = [
  { name: 'Grand Peacock', type: 'Grand', icon: '🦚' },
  { name: 'Mythological Scene', type: 'Mythical', icon: '🎭' },
  { name: 'Floral Cascade', type: 'Floral', icon: '🌸' },
  { name: 'Temple Architecture', type: 'Temple', icon: '🏛️' },
  { name: 'Geometric Mandala', type: 'Geometric', icon: '🔷' },
  { name: 'Royal Elephant', type: 'Animal', icon: '🐘' },
];

const ZARI_TYPES = [
  { name: 'Gold', color: '#FFD700', description: 'Traditional 22K look' },
  { name: 'Silver', color: '#E8E8E8', description: 'Elegant platinum finish' },
  { name: 'Copper', color: '#CD7F32', description: 'Warm rose gold tone' },
];

export const DesignAccordion = ({ sareeState, updatePart, onGenerate }) => {
  const [searchTerms, setSearchTerms] = useState({
    border: '',
    body: '',
    pallu: ''
  });

  const [motifSearchKeywords, setMotifSearchKeywords] = useState({
    border: '',
    body: '',
    pallu: ''
  });

  const [generatedMotifs, setGeneratedMotifs] = useState({
    border: [],
    body: [],
    pallu: []
  });

  const [isGeneratingMotifs, setIsGeneratingMotifs] = useState({
    border: false,
    body: false,
    pallu: false
  });

  const handlePatternSelect = (section, pattern) => {
    updatePart(section, { pattern: pattern.name });
    toast.success(`${pattern.name} selected`, {
      description: `Applied to ${section} section`,
      icon: pattern.icon,
    });
  };

  const handleZariSelect = (section, zari) => {
    updatePart(section, { zari: zari.name });
    toast.success(`${zari.name} zari selected`, {
      description: zari.description,
    });
  };

  const filterPatterns = (patterns, searchTerm) => {
    if (!searchTerm) return patterns;
    return patterns.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleMotifSearch = async (section) => {
    const keyword = motifSearchKeywords[section].trim();
    if (!keyword) {
      toast.error('Please enter a search keyword');
      return;
    }

    setIsGeneratingMotifs(prev => ({ ...prev, [section]: true }));
    
    try {
      const zariType = sareeState[section].zari;
      const prompt = `A single high-resolution Kanjeevaram ${keyword} motif, flat textile design, traditional South Indian style, ${zariType} zari, solid background, seamless pattern`;
      
      // Call backend API to generate motifs
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-motifs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          count: 4,
          section,
          keyword
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate motifs');
      }

      const data = await response.json();
      
      setGeneratedMotifs(prev => ({
        ...prev,
        [section]: data.motifs || []
      }));

      toast.success(`${keyword} motifs generated!`, {
        description: `Click on a motif to apply it to your ${section}`,
      });
    } catch (error) {
      console.error('Error generating motifs:', error);
      toast.error('Failed to generate motifs', {
        description: 'Please try again or use a different keyword',
      });
    } finally {
      setIsGeneratingMotifs(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleApplyMotif = (section, motifUrl) => {
    updatePart(section, { motifUrl });
    toast.success('Motif applied!', {
      description: `${section} section updated with custom pattern`,
      icon: '✨',
    });
  };

  return (
    <Accordion type="single" collapsible defaultValue="border" className="space-y-4">
      {/* Border Designs */}
      <AccordionItem value="border" className="border border-border rounded-lg px-4 shadow-soft">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-primary">Border Designs</p>
              <p className="text-xs text-muted-foreground">Traditional temple and floral motifs</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          {/* Pattern Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search border designs..."
              value={searchTerms.border}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, border: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* AI Motif Discovery */}
          <Card className="bg-gradient-to-br from-secondary/5 to-accent/10 border-secondary/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-secondary" />
                <Label className="text-sm font-semibold text-primary">AI Motif Discovery</Label>
              </div>
              <p className="text-xs text-muted-foreground">Generate custom Kanjeevaram motifs using AI</p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Peacock, Temple, Floral..."
                  value={motifSearchKeywords.border}
                  onChange={(e) => setMotifSearchKeywords(prev => ({ ...prev, border: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleMotifSearch('border')}
                  disabled={isGeneratingMotifs.border}
                />
                <Button
                  onClick={() => handleMotifSearch('border')}
                  disabled={isGeneratingMotifs.border}
                  className="bg-secondary hover:bg-secondary/90 text-primary"
                >
                  {isGeneratingMotifs.border ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Generated Motifs Grid */}
              {generatedMotifs.border.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-medium">Generated Motifs (Click to apply)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {generatedMotifs.border.map((motif, index) => (
                      <button
                        key={index}
                        onClick={() => handleApplyMotif('border', motif)}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-secondary transition-all hover:scale-105 shadow-sm"
                      >
                        <img 
                          src={motif} 
                          alt={`Motif ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {sareeState.border.motifUrl === motif && (
                          <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                            <Badge variant="secondary" className="text-xs">Applied</Badge>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pattern Cards */}
          <div className="grid grid-cols-2 gap-3">
            {filterPatterns(BORDER_DESIGNS, searchTerms.border).map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => handlePatternSelect('border', pattern)}
                className="text-left"
              >
                <Card className={
                  sareeState.border.pattern === pattern.name
                    ? 'border-2 border-secondary shadow-gold bg-secondary/5'
                    : 'border border-border hover:border-primary/50 hover:shadow-medium transition-all'
                }>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{pattern.icon}</span>
                      {sareeState.border.pattern === pattern.name && (
                        <Badge variant="secondary" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-foreground">{pattern.name}</p>
                    <Badge variant="outline" className="text-xs">{pattern.type}</Badge>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
          
          {/* Zari Selection for Border */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Zari Work</Label>
            <div className="grid grid-cols-3 gap-2">
              {ZARI_TYPES.map((zari) => (
                <button
                  key={zari.name}
                  onClick={() => handleZariSelect('border', zari)}
                  className={
                    sareeState.border.zari === zari.name
                      ? 'p-3 rounded-lg border-2 shadow-md transition-all'
                      : 'p-3 rounded-lg border border-border hover:border-primary/50 transition-all'
                  }
                  style={{ borderColor: sareeState.border.zari === zari.name ? zari.color : undefined }}
                >
                  <div className="w-8 h-8 rounded-full mx-auto mb-2 shadow-sm" style={{ backgroundColor: zari.color }}></div>
                  <p className="text-xs font-semibold text-center">{zari.name}</p>
                </button>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      {/* Body Patterns */}
      <AccordionItem value="body" className="border border-border rounded-lg px-4 shadow-soft">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-primary">Body Patterns</p>
              <p className="text-xs text-muted-foreground">Buttas, checks, and traditional weaves</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          {/* Pattern Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search body patterns..."
              value={searchTerms.body}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, body: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* AI Motif Discovery */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold text-primary">AI Motif Discovery</Label>
              </div>
              <p className="text-xs text-muted-foreground">Generate custom Kanjeevaram motifs using AI</p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Butta, Paisley, Checks..."
                  value={motifSearchKeywords.body}
                  onChange={(e) => setMotifSearchKeywords(prev => ({ ...prev, body: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleMotifSearch('body')}
                  disabled={isGeneratingMotifs.body}
                />
                <Button
                  onClick={() => handleMotifSearch('body')}
                  disabled={isGeneratingMotifs.body}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  {isGeneratingMotifs.body ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Generated Motifs Grid */}
              {generatedMotifs.body.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-medium">Generated Motifs (Click to apply)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {generatedMotifs.body.map((motif, index) => (
                      <button
                        key={index}
                        onClick={() => handleApplyMotif('body', motif)}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all hover:scale-105 shadow-sm"
                      >
                        <img 
                          src={motif} 
                          alt={`Motif ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {sareeState.body.motifUrl === motif && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Badge variant="secondary" className="text-xs">Applied</Badge>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pattern Cards */}
          <div className="grid grid-cols-2 gap-3">
            {filterPatterns(BODY_PATTERNS, searchTerms.body).map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => handlePatternSelect('body', pattern)}
                className="text-left"
              >
                <Card className={
                  sareeState.body.pattern === pattern.name
                    ? 'border-2 border-secondary shadow-gold bg-secondary/5'
                    : 'border border-border hover:border-primary/50 hover:shadow-medium transition-all'
                }>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{pattern.icon}</span>
                      {sareeState.body.pattern === pattern.name && (
                        <Badge variant="secondary" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-foreground">{pattern.name}</p>
                    <Badge variant="outline" className="text-xs">{pattern.type}</Badge>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
          
          {/* Zari Selection for Body */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Zari Work</Label>
            <div className="grid grid-cols-3 gap-2">
              {ZARI_TYPES.map((zari) => (
                <button
                  key={zari.name}
                  onClick={() => handleZariSelect('body', zari)}
                  className={
                    sareeState.body.zari === zari.name
                      ? 'p-3 rounded-lg border-2 shadow-md transition-all'
                      : 'p-3 rounded-lg border border-border hover:border-primary/50 transition-all'
                  }
                  style={{ borderColor: sareeState.body.zari === zari.name ? zari.color : undefined }}
                >
                  <div className="w-8 h-8 rounded-full mx-auto mb-2 shadow-sm" style={{ backgroundColor: zari.color }}></div>
                  <p className="text-xs font-semibold text-center">{zari.name}</p>
                </button>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      {/* Pallu Artistry */}
      <AccordionItem value="pallu" className="border border-border rounded-lg px-4 shadow-soft">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-primary">Pallu Artistry</p>
              <p className="text-xs text-muted-foreground">Grand designs and intricate motifs</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          {/* Pattern Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pallu designs..."
              value={searchTerms.pallu}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, pallu: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* AI Motif Discovery */}
          <Card className="bg-gradient-to-br from-accent/10 to-secondary/5 border-accent/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold text-primary">AI Motif Discovery</Label>
              </div>
              <p className="text-xs text-muted-foreground">Generate grand Kanjeevaram motifs using AI</p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Grand Peacock, Mythological..."
                  value={motifSearchKeywords.pallu}
                  onChange={(e) => setMotifSearchKeywords(prev => ({ ...prev, pallu: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleMotifSearch('pallu')}
                  disabled={isGeneratingMotifs.pallu}
                />
                <Button
                  onClick={() => handleMotifSearch('pallu')}
                  disabled={isGeneratingMotifs.pallu}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  {isGeneratingMotifs.pallu ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Generated Motifs Grid */}
              {generatedMotifs.pallu.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-medium">Generated Motifs (Click to apply)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {generatedMotifs.pallu.map((motif, index) => (
                      <button
                        key={index}
                        onClick={() => handleApplyMotif('pallu', motif)}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-secondary transition-all hover:scale-105 shadow-sm"
                      >
                        <img 
                          src={motif} 
                          alt={`Motif ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {sareeState.pallu.motifUrl === motif && (
                          <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                            <Badge variant="secondary" className="text-xs">Applied</Badge>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pattern Cards */}
          <div className="grid grid-cols-2 gap-3">
            {filterPatterns(PALLU_DESIGNS, searchTerms.pallu).map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => handlePatternSelect('pallu', pattern)}
                className="text-left"
              >
                <Card className={
                  sareeState.pallu.pattern === pattern.name
                    ? 'border-2 border-secondary shadow-gold bg-secondary/5'
                    : 'border border-border hover:border-primary/50 hover:shadow-medium transition-all'
                }>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{pattern.icon}</span>
                      {sareeState.pallu.pattern === pattern.name && (
                        <Badge variant="secondary" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-foreground">{pattern.name}</p>
                    <Badge variant="outline" className="text-xs">{pattern.type}</Badge>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
          
          {/* Zari Selection for Pallu */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Zari Work</Label>
            <div className="grid grid-cols-3 gap-2">
              {ZARI_TYPES.map((zari) => (
                <button
                  key={zari.name}
                  onClick={() => handleZariSelect('pallu', zari)}
                  className={
                    sareeState.pallu.zari === zari.name
                      ? 'p-3 rounded-lg border-2 shadow-md transition-all'
                      : 'p-3 rounded-lg border border-border hover:border-primary/50 transition-all'
                  }
                  style={{ borderColor: sareeState.pallu.zari === zari.name ? zari.color : undefined }}
                >
                  <div className="w-8 h-8 rounded-full mx-auto mb-2 shadow-sm" style={{ backgroundColor: zari.color }}></div>
                  <p className="text-xs font-semibold text-center">{zari.name}</p>
                </button>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DesignAccordion;