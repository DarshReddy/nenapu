import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Wand2, Check } from 'lucide-react';
import { toast } from 'sonner';

// Category and customization options
const BORDER_CATEGORIES = ['Temple', 'Floral', 'Geometric', 'Animal', 'Traditional', 'Sacred'];
const BORDER_SIZES = [
  { label: 'Small (1")', value: 'Small', inches: 1 },
  { label: 'Medium (2")', value: 'Medium', inches: 2 },
  { label: 'Large (3")', value: 'Large', inches: 3 },
  { label: 'Extra Large (4")', value: 'XLarge', inches: 4 }
];
const BODY_CATEGORIES = ['Plain', 'Buttas', 'Checks', 'Paisley', 'Geometric', 'Forest', 'Korvai', 'Stripes'];
const PALLU_CATEGORIES = ['Grand', 'Temple', 'Mythical', 'Floral', 'Geometric', 'Animal', 'Minimal'];
const ZARI_LEVELS = ['Light', 'Medium', 'Heavy'];
import { 
  generateBorderMotifs,
  generateBodyMotifs,
  generatePalluMotifs
} from '@/services/geminiService';

const BORDER_DESIGNS = [
  { name: 'Temple Border', type: 'Temple', image: '/designs/border/temple_border.png' },
  { name: 'Peacock', type: 'Animal', image: '/designs/border/peacock.png' },
  { name: 'Mallinaggu', type: 'Floral', image: '/designs/border/mallinaggu.png' },
  { name: 'Rettai Pattu', type: 'Traditional', image: '/designs/border/rettai_pattu.png' },
  { name: 'Gopuram', type: 'Temple', image: '/designs/border/gopuram.png' },
  { name: 'Rudraksha', type: 'Sacred', image: '/designs/border/rudraksha.png' },
];

const BODY_PATTERNS = [
  { name: 'Butta Small', type: 'Buttas', image: '/designs/body/butta_small.png' },
  { name: 'Vanasingaram', type: 'Forest', image: '/designs/body/vanasingaram.png' },
  { name: 'Checks', type: 'Geometric', image: '/designs/body/checks.png' },
  { name: 'Paisley', type: 'Traditional', image: '/designs/body/paisley.png' },
  { name: 'Stripe Korvai', type: 'Korvai', image: '/designs/body/stripe_korvai.png' },
  { name: 'Plain Weave', type: 'Classic', image: '/designs/body/plain_weave.png' },
];

const PALLU_DESIGNS = [
  { name: 'Grand Peacock', type: 'Grand', image: '/designs/pallu/grand_peacock.png' },
  { name: 'Mythological Scene', type: 'Mythical', image: '/designs/pallu/mythological_scene.png' },
  { name: 'Floral Cascade', type: 'Floral', image: '/designs/pallu/floral_cascade.png' },
  { name: 'Temple Architecture', type: 'Temple', image: '/designs/pallu/temple_architecture.png' },
  { name: 'Geometric Mandala', type: 'Geometric', image: '/designs/pallu/geometric_mandala.png' },
  { name: 'Royal Elephant', type: 'Animal', image: '/designs/pallu/royal_elephant.png' },
];

export const DesignAccordion = ({ sareeState, updatePart, applyDesign, isGenerating }) => {
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

  const [selectedMotif, setSelectedMotif] = useState({
    border: null,
    body: null,
    pallu: null
  });

  const handleMotifSearch = async (section) => {
    const keyword = motifSearchKeywords[section].trim();
    if (!keyword) {
      toast.error('Please enter a search keyword');
      return;
    }

    setIsGeneratingMotifs(prev => ({ ...prev, [section]: true }));

    try {
      const zariType = sareeState.zari;
      let data;

      // Call section-specific generation function
      if (section === 'border') {
        const { category, size, sizeInches } = sareeState.border;
        data = await generateBorderMotifs(
          keyword,
          category,
          size,
          sizeInches,
          zariType,
          4
        );
      } else if (section === 'body') {
        const { category, zariLevel } = sareeState.body;
        data = await generateBodyMotifs(
          keyword,
          category,
          zariLevel,
          4
        );
      } else if (section === 'pallu') {
        const { category, zariLevel } = sareeState.pallu;
        data = await generatePalluMotifs(
          keyword,
          category,
          zariLevel,
          4
        );
      }

      setGeneratedMotifs(prev => ({
        ...prev,
        [section]: data.motifs || []
      }));

      toast.success(`${keyword} designs generated!`, {
        description: `Select a design and click "Apply to Saree"`,
      });
    } catch (error) {
      console.error('Error generating motifs:', error);
      toast.error('Failed to generate designs', {
        description: 'Please try again or use a different keyword',
      });
    } finally {
      setIsGeneratingMotifs(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleSelectMotif = (section, motifUrl, patternName) => {
    setSelectedMotif(prev => ({ ...prev, [section]: { url: motifUrl, name: patternName } }));
    updatePart(section, { pattern: patternName });
  };

  const handleApplyToSaree = async (section) => {
    const selected = selectedMotif[section];
    if (!selected) {
      toast.error('Please select a design first');
      return;
    }
    await applyDesign(section, selected.url, selected.name);
  };

  const renderSection = (section, title, description, designs, colorClass) => (
    <AccordionItem value={section} className="border border-border rounded-lg px-4 shadow-soft">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-primary">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-4">
        {/* Section-specific Settings */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-4">
            <Label className="text-sm font-semibold text-primary">Design Settings</Label>

            {section === 'border' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <Select
                    value={sareeState.border.category}
                    onValueChange={(value) => updatePart('border', { category: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDER_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Border Size</Label>
                  <Select
                    value={sareeState.border.size}
                    onValueChange={(value) => {
                      const sizeData = BORDER_SIZES.find(s => s.value === value);
                      updatePart('border', { size: value, sizeInches: sizeData.inches });
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDER_SIZES.map(size => (
                        <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {section === 'body' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Pattern Category</Label>
                  <Select
                    value={sareeState.body.category}
                    onValueChange={(value) => updatePart('body', { category: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Zari Level</Label>
                  <Select
                    value={sareeState.body.zariLevel}
                    onValueChange={(value) => updatePart('body', { zariLevel: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZARI_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {section === 'pallu' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Design Category</Label>
                  <Select
                    value={sareeState.pallu.category}
                    onValueChange={(value) => updatePart('pallu', { category: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PALLU_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Zari Level</Label>
                  <Select
                    value={sareeState.pallu.zariLevel}
                    onValueChange={(value) => updatePart('pallu', { zariLevel: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZARI_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Search */}
        <Card className="bg-gradient-to-br from-secondary/5 to-accent/10 border-secondary/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-secondary" />
              <Label className="text-sm font-semibold text-primary">AI Design Generator</Label>
            </div>
            <p className="text-xs text-muted-foreground">Describe the design you want (e.g., "peacock feathers", "lotus flowers")</p>

            <div className="flex gap-2">
              <Input
                placeholder={`Search ${section} designs...`}
                value={motifSearchKeywords[section]}
                onChange={(e) => setMotifSearchKeywords(prev => ({ ...prev, [section]: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleMotifSearch(section)}
                disabled={isGeneratingMotifs[section] || isGenerating}
              />
              <Button
                onClick={() => handleMotifSearch(section)}
                disabled={isGeneratingMotifs[section] || isGenerating}
                className="bg-secondary hover:bg-secondary/90 text-primary"
              >
                {isGeneratingMotifs[section] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Generated Designs Grid */}
            {generatedMotifs[section].length > 0 && (
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-medium">Generated Designs (Click to select)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {generatedMotifs[section].map((motif, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectMotif(section, motif, `AI Design ${index + 1}`)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 shadow-sm ${
                        selectedMotif[section]?.url === motif
                          ? 'border-secondary ring-2 ring-secondary/50'
                          : 'border-border hover:border-secondary'
                      }`}
                    >
                      <img
                        src={motif}
                        alt={`Design ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedMotif[section]?.url === motif && (
                        <div className="absolute top-1 right-1 bg-secondary rounded-full p-1">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Apply Button */}
                <Button
                  onClick={() => handleApplyToSaree(section)}
                  disabled={!selectedMotif[section] || isGenerating}
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating Saree Preview...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Apply to Saree
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preset Designs */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Or choose from presets:</Label>
          <div className="grid grid-cols-3 gap-2">
            {designs.map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => handleSelectMotif(section, pattern.image, pattern.name)}
                className="text-left"
              >
                <Card className={
                  selectedMotif[section]?.name === pattern.name
                    ? 'border-2 border-secondary shadow-gold bg-secondary/5'
                    : 'border border-border hover:border-primary/50 hover:shadow-medium transition-all'
                }>
                  <CardContent className="p-2 space-y-1">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={pattern.image}
                        alt={pattern.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedMotif[section]?.name === pattern.name && (
                        <div className="absolute top-1 right-1 bg-secondary rounded-full p-1">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-xs text-foreground truncate">{pattern.name}</p>
                    <Badge variant="outline" className="text-xs">{pattern.type}</Badge>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {/* Apply Preset Button */}
          {selectedMotif[section] && !generatedMotifs[section].includes(selectedMotif[section]?.url) && (
            <Button
              onClick={() => handleApplyToSaree(section)}
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating Saree Preview...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply {selectedMotif[section]?.name} to Saree
                </>
              )}
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <Accordion type="single" collapsible defaultValue="border" className="space-y-4">
      {renderSection('border', 'Border Designs', 'Traditional temple and floral borders', BORDER_DESIGNS, 'bg-secondary/10')}
      {renderSection('body', 'Body Patterns', 'Buttas, checks, and traditional weaves', BODY_PATTERNS, 'bg-primary/10')}
      {renderSection('pallu', 'Pallu Artistry', 'Grand designs and intricate motifs', PALLU_DESIGNS, 'bg-accent/30')}
    </Accordion>
  );
};

export default DesignAccordion;
