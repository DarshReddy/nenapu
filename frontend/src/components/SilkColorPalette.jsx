import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';
import { toast } from 'sonner';

const TRADITIONAL_COLORS = [
  { name: 'Arakku Red', value: '#8B0000', description: 'Traditional temple red' },
  { name: 'MS Blue', value: '#000080', description: 'Mysore silk blue' },
  { name: 'Kili Pachai', value: '#046307', description: 'Parrot green' },
  { name: 'Kanakambaram', value: '#FFD700', description: 'Golden yellow' },
  { name: 'Ananda Purple', value: '#4B0082', description: 'Royal indigo' },
  { name: 'Kumkum Orange', value: '#FF6347', description: 'Sacred vermillion' },
];

export const SilkColorPalette = ({ sareeState, updatePart }) => {
  const [activeSection, setActiveSection] = useState('body');
  
  const handleColorSelect = (color, name) => {
    updatePart(activeSection, { color });
    toast.success(`${name} applied`, {
      description: `Color updated for ${activeSection}`,
    });
  };

  const handleCustomColor = (e) => {
    updatePart(activeSection, { color: e.target.value });
  };

  return (
    <Card className="shadow-medium border-border/50 bg-gradient-to-br from-card to-accent/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-secondary" />
          <CardTitle className="text-xl text-primary">Signature Silk Palette</CardTitle>
        </div>
        <CardDescription>Traditional Kanchipuram colors with authentic silk finish</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Apply Color To:</Label>
          <div className="flex gap-2">
            {['body', 'border', 'pallu'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={
                  activeSection === section
                    ? 'px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all shadow-md'
                    : 'px-4 py-2 rounded-lg bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-all'
                }
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Current Color Display */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Current Color</Label>
          <div className="flex gap-3 items-center">
            <div 
              className="w-16 h-16 rounded-lg border-2 border-border shadow-medium relative overflow-hidden group"
              style={{ backgroundColor: sareeState[activeSection].color }}
            >
              {/* Silk texture overlay */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 2px, transparent 4px)',
              }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15 opacity-20"></div>
            </div>
            <div className="flex-1">
              <Input
                type="text"
                value={sareeState[activeSection].color.toUpperCase()}
                onChange={(e) => updatePart(activeSection, { color: e.target.value })}
                className="font-mono text-sm"
                placeholder="#000000"
              />
              <p className="text-xs text-muted-foreground mt-1">Hex color code</p>
            </div>
            <Input
              type="color"
              value={sareeState[activeSection].color}
              onChange={handleCustomColor}
              className="h-16 w-16 cursor-pointer"
            />
          </div>
        </div>
        
        {/* Traditional Color Swatches */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Traditional Silk Swatches</Label>
          <div className="grid grid-cols-3 gap-3">
            {TRADITIONAL_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value, color.name)}
                className="group relative"
              >
                <div className={
                  sareeState[activeSection].color.toUpperCase() === color.value.toUpperCase()
                    ? 'p-1 rounded-xl bg-secondary shadow-gold'
                    : 'p-1 rounded-xl bg-transparent hover:bg-muted transition-all'
                }>
                  <div 
                    className="aspect-square rounded-lg overflow-hidden shadow-soft relative"
                    style={{ backgroundColor: color.value }}
                  >
                    {/* Silk-finish texture */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, transparent 2px, transparent 4px)',
                    }}></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 opacity-20"></div>
                    
                    {sareeState[activeSection].color.toUpperCase() === color.value.toUpperCase() && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs font-medium text-foreground mt-2 text-center">{color.name}</p>
                <p className="text-xs text-muted-foreground text-center">{color.description}</p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from 'react';

export default SilkColorPalette;