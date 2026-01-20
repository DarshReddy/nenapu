import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const PATTERNS = [
  'Temple Border',
  'Peacock',
  'Floral',
  'Paisley',
  'Checks',
  'Geometric',
  'Elephant',
  'Traditional Butta',
  'Korvai',
  'Kodi Visiri'
];

const ZARI_TYPES = ['Gold', 'Silver', 'Copper'];

// New category options for each section
const BORDER_CATEGORIES = [
  'Temple',
  'Floral',
  'Geometric',
  'Animal',
  'Traditional',
  'Sacred'
];

const BORDER_SIZES = [
  { label: 'Small', value: 'Small', inches: 1 },
  { label: 'Medium', value: 'Medium', inches: 2 },
  { label: 'Large', value: 'Large', inches: 3 },
  { label: 'Extra Large', value: 'XLarge', inches: 4 }
];

const BODY_CATEGORIES = [
  'Plain',
  'Buttas',
  'Checks',
  'Paisley',
  'Geometric',
  'Forest',
  'Korvai',
  'Stripes'
];

const PALLU_CATEGORIES = [
  'Grand',
  'Temple',
  'Mythical',
  'Floral',
  'Geometric',
  'Animal',
  'Minimal'
];

const ZARI_LEVELS = [
  'Light',
  'Medium',
  'Heavy'
];

const COLOR_PRESETS = [
  { name: 'Classic Maroon', value: '#8B0000' },
  { name: 'Royal Blue', value: '#000080' },
  { name: 'Emerald Green', value: '#046307' },
  { name: 'Deep Purple', value: '#4B0082' },
  { name: 'Rust Orange', value: '#B7410E' },
  { name: 'Golden Yellow', value: '#FFD700' },
  { name: 'Peacock Blue', value: '#005F73' },
  { name: 'Magenta', value: '#8B008B' },
  { name: 'Teal', value: '#008080' },
  { name: 'Wine Red', value: '#722F37' },
];

export const PartCustomizer = ({ part, partState, updatePart, onGenerate }) => {
  const handleColorChange = (color) => {
    updatePart(part, { color });
  };

  const handlePatternSelect = (pattern) => {
    updatePart(part, { pattern });
    toast.success(`${pattern} pattern selected`, {
      description: `Applied to ${part} section`,
    });
  };

  const handleZariSelect = (zari) => {
    updatePart(part, { zari });
    toast.success(`${zari} zari selected`, {
      description: `Applied to ${part} section`,
    });
  };

  const handleCategoryChange = (category) => {
    updatePart(part, { category });
    toast.success(`${category} category selected`);
  };

  const handleBorderSizeChange = (size) => {
    const sizeData = BORDER_SIZES.find(s => s.value === size);
    updatePart(part, { size: sizeData.value, sizeInches: sizeData.inches });
    toast.success(`${sizeData.label} border selected`);
  };

  const handleZariLevelChange = (level) => {
    updatePart(part, { zariLevel: level });
    toast.success(`${level} zari level selected`);
  };

  const handleMotifUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a server
      const url = URL.createObjectURL(file);
      updatePart(part, { motifUrl: url });
      toast.success('Motif uploaded successfully', {
        description: 'Your custom motif has been added',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Design Category Selection */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Design Category</CardTitle>
          <CardDescription>Choose the design style for your {part}</CardDescription>
        </CardHeader>
        <CardContent>
          {part === 'border' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Border Category</Label>
                <Select value={partState.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
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
                <Label>Border Size</Label>
                <Select value={partState.size} onValueChange={handleBorderSizeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BORDER_SIZES.map(size => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label} ({size.inches}" wide)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {part === 'body' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Body Pattern Category</Label>
                <Select value={partState.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
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
                <Label>Zari Level</Label>
                <Select value={partState.zariLevel} onValueChange={handleZariLevelChange}>
                  <SelectTrigger>
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
          {part === 'pallu' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pallu Design Category</Label>
                <Select value={partState.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
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
                <Label>Zari Level</Label>
                <Select value={partState.zariLevel} onValueChange={handleZariLevelChange}>
                  <SelectTrigger>
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

      {/* Color Selection */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Color Selection</CardTitle>
          <CardDescription>Choose the base color for your {part}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor={`${part}-color`} className="text-sm font-medium">
              Current Color
            </Label>
            <div className="flex gap-3 items-center">
              <Input
                id={`${part}-color`}
                type="color"
                value={partState.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-12 w-24 cursor-pointer"
              />
              <Input
                type="text"
                value={partState.color.toUpperCase()}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Color Presets</Label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleColorChange(preset.value)}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-110 hover:shadow-medium"
                  style={{ 
                    backgroundColor: preset.value,
                    borderColor: partState.color === preset.value ? 'hsl(var(--secondary))' : 'hsl(var(--border))'
                  }}
                  title={preset.name}
                >
                  {partState.color === preset.value && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-3 h-3 rounded-full bg-white shadow-md"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pattern Selection */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Pattern Selection</CardTitle>
          <CardDescription>Select traditional motifs and designs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PATTERNS.map((pattern) => (
              <button
                key={pattern}
                onClick={() => handlePatternSelect(pattern)}
                className="group relative"
              >
                <Card className={
                  partState.pattern === pattern
                    ? 'border-2 border-secondary shadow-gold bg-secondary/5'
                    : 'border border-border hover:border-primary/50 hover:shadow-medium transition-all'
                }>
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="text-2xl">🎨</div>
                    <p className="text-sm font-medium text-foreground">{pattern}</p>
                  </CardContent>
                </Card>
                {partState.pattern === pattern && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 shadow-md"
                  >
                    Selected
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Zari Selection */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Zari Work</CardTitle>
          <CardDescription>Choose the type of metallic thread work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {ZARI_TYPES.map((zari) => {
              const zariColors = {
                Gold: '#FFD700',
                Silver: '#C0C0C0',
                Copper: '#B87333'
              };
              
              return (
                <button
                  key={zari}
                  onClick={() => handleZariSelect(zari)}
                  className="group"
                >
                  <Card className={
                    partState.zari === zari
                      ? 'border-2 shadow-gold'
                      : 'border border-border hover:border-primary/50 hover:shadow-medium transition-all'
                  }
                  style={{
                    borderColor: partState.zari === zari ? zariColors[zari] : undefined
                  }}>
                    <CardContent className="p-6 text-center space-y-3">
                      <div 
                        className="w-12 h-12 rounded-full mx-auto shadow-medium"
                        style={{ backgroundColor: zariColors[zari] }}
                      ></div>
                      <p className="font-semibold text-foreground">{zari}</p>
                      {partState.zari === zari && (
                        <Badge variant="secondary">Selected</Badge>
                      )}
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Custom Motif Upload */}
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Custom Motif</CardTitle>
          <CardDescription>Upload your own design or motif (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Label 
                htmlFor={`${part}-motif`} 
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Click to upload motif</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
              </Label>
              <Input
                id={`${part}-motif`}
                type="file"
                accept="image/*"
                onChange={handleMotifUpload}
                className="hidden"
              />
            </div>
            
            {partState.motifUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                <img 
                  src={partState.motifUrl} 
                  alt="Custom motif" 
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => updatePart(part, { motifUrl: '' })}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Button */}
      <Button 
        onClick={onGenerate}
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-medium hover:shadow-elevated transition-all duration-300"
        size="lg"
      >
        Apply Changes
      </Button>
    </div>
  );
};

export default PartCustomizer;