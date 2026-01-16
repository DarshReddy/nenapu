import { useState } from 'react';
import Header from './Header';
import SareeVisualizer from './SareeVisualizer';
import CustomizerPanel from './CustomizerPanel';

export const SareeCustomizer = () => {
  const [sareeState, setSareeState] = useState({
    body: {
      color: '#8B0000',
      pattern: 'Temple Border',
      zari: 'Gold',
      motifUrl: ''
    },
    border: {
      color: '#D4AF37',
      pattern: 'Peacock',
      zari: 'Gold',
      motifUrl: ''
    },
    pallu: {
      color: '#4A0404',
      pattern: 'Floral',
      zari: 'Silver',
      motifUrl: ''
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const updatePart = (part, updates) => {
    setSareeState(prev => ({
      ...prev,
      [part]: { ...prev[part], ...updates }
    }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate image generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left: Sticky Visualizer */}
        <div className="lg:w-1/2 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] order-2 lg:order-1">
          <SareeVisualizer 
            sareeState={sareeState} 
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>
        
        {/* Right: Scrollable Customizer Panel */}
        <div className="lg:w-1/2 order-1 lg:order-2 elegant-scroll overflow-y-auto">
          <CustomizerPanel 
            sareeState={sareeState} 
            updatePart={updatePart}
            onGenerate={handleGenerate}
          />
        </div>
      </div>
    </div>
  );
};

export default SareeCustomizer;