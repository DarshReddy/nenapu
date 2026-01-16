import SilkColorPalette from './SilkColorPalette';
import DesignAccordion from './DesignAccordion';

export const ControlPanel = ({ sareeState, updatePart, onGenerate }) => {
  return (
    <div className="h-full p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-primary">
          Craft Your Masterpiece
        </h2>
        <p className="text-muted-foreground text-lg">
          Select colors, patterns, and zari work inspired by Kanchipuram tradition
        </p>
      </div>
      
      {/* Signature Silk Palette */}
      <SilkColorPalette 
        sareeState={sareeState}
        updatePart={updatePart}
      />
      
      {/* Design Accordions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Design Sections</h3>
        <DesignAccordion 
          sareeState={sareeState}
          updatePart={updatePart}
          onGenerate={onGenerate}
        />
      </div>
    </div>
  );
};

export default ControlPanel;