import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Palette, Paintbrush } from 'lucide-react';
import { toast } from 'sonner';

const TRADITIONAL_COLORS = [
  { name: 'Arakku Red', value: '#8B0000', description: 'Traditional temple red' },
  { name: 'MS Blue', value: '#000080', description: 'Mysore silk blue' },
  { name: 'Kili Pachai', value: '#046307', description: 'Parrot green' },
  { name: 'Kanakambaram', value: '#FFD700', description: 'Golden yellow' },
  { name: 'Ananda Purple', value: '#4B0082', description: 'Royal indigo' },
  { name: 'Kumkum Orange', value: '#FF6347', description: 'Sacred vermillion' },
];

const SECTIONS = [
  { id: 'body', label: 'Body', description: 'Main fabric area' },
  { id: 'border', label: 'Border', description: 'Edge detailing' },
  { id: 'pallu', label: 'Pallu', description: 'Decorative end' },
];

export const SilkColorPalette = ({ sareeState, applyColors, isGenerating }) => {
  // Local state for color selections (independent of sareeState until applied)
  const [localColors, setLocalColors] = useState({
    body: sareeState.body.color || '',
    border: sareeState.border.color || '',
    pallu: sareeState.pallu.color || '',
  });
  const [activeSection, setActiveSection] = useState('body');

  const handleColorSelect = (color, colorName) => {
    setLocalColors(prev => ({
      ...prev,
      [activeSection]: color
    }));
    toast.success(`${colorName} selected for ${activeSection}`);
  };

  const handleCustomColor = (section, color) => {
    setLocalColors(prev => ({
      ...prev,
      [section]: color
    }));
  };

  const allColorsSelected = localColors.body && localColors.border && localColors.pallu;

  const handleApplyColors = () => {
    if (!allColorsSelected) {
      toast.error('Please select colors for all sections', {
        description: 'Body, Border, and Pallu colors are required'
      });
      return;
    }
    applyColors(localColors);
    toast.success('Colors applied!', {
      description: 'Generating saree preview...'
    });
  };

  return (
    <Card className="shadow-medium border-border/50 bg-gradient-to-br from-card to-accent/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-secondary" />
          <CardTitle className="text-xl text-primary">Signature Silk Palette</CardTitle>
        </div>
        <CardDescription>Select colors for all three sections, then apply to generate preview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Color Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Color Selection Status</Label>
          <div className="grid grid-cols-3 gap-3">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  activeSection === section.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-secondary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-lg border-2 ${
                      localColors[section.id] ? 'border-secondary shadow-sm' : 'border-dashed border-muted-foreground'
                    }`}
                    style={{ backgroundColor: localColors[section.id] || '#f5f5f5' }}
                  >
                    {!localColors[section.id] && (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {localColors[section.id] ? 'Selected' : 'Not set'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Section Color Picker */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Select Color for {SECTIONS.find(s => s.id === activeSection)?.label}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={localColors[activeSection] || '#888888'}
                onChange={(e) => handleCustomColor(activeSection, e.target.value)}
                className="h-8 w-12 cursor-pointer p-0 border-0"
              />
              <Input
                type="text"
                value={localColors[activeSection]?.toUpperCase() || ''}
                onChange={(e) => handleCustomColor(activeSection, e.target.value)}
                className="font-mono text-xs w-24"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Traditional Color Swatches */}
          <div className="grid grid-cols-6 gap-2">
            {TRADITIONAL_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value, color.name)}
                className="group relative"
                title={`${color.name} - ${color.description}`}
              >
                <div className={`p-0.5 rounded-lg transition-all ${
                  localColors[activeSection]?.toUpperCase() === color.value.toUpperCase()
                    ? 'bg-secondary shadow-gold'
                    : 'bg-transparent hover:bg-muted'
                }`}>
                  <div
                    className="aspect-square rounded-md overflow-hidden shadow-soft relative"
                    style={{ backgroundColor: color.value }}
                  >
                    {/* Silk-finish texture */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, transparent 2px, transparent 4px)',
                    }}></div>
                    {localColors[activeSection]?.toUpperCase() === color.value.toUpperCase() && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-3 h-3 rounded-full bg-white shadow-md"></div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] font-medium text-foreground mt-1 text-center truncate">{color.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={handleApplyColors}
          disabled={!allColorsSelected || isGenerating}
          className="w-full"
          size="lg"
        >
          <Paintbrush className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating Preview...' : 'Apply Colors & Generate Preview'}
        </Button>

        {!allColorsSelected && (
          <p className="text-xs text-center text-muted-foreground">
            Select colors for {
              [
                !localColors.body && 'Body',
                !localColors.border && 'Border',
                !localColors.pallu && 'Pallu'
              ].filter(Boolean).join(', ')
            } to enable preview
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SilkColorPalette;
