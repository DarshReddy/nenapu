import { useState } from 'react';
import Header from './Header';
import SareeVisualizer from './SareeVisualizer';
import ControlPanel from './ControlPanel';

export const SareeCustomizer = () => {
  const [sareeState, setSareeState] = useState({
    body: {
      color: '#C62828',
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
      zari: 'Gold',
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

  const weaveSaree = () => {
    setIsGenerating(true);
    // Simulate weaving/generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Left Panel (50%): Fixed Visualizer */}
        <div className="lg:w-1/2 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] order-2 lg:order-1 overflow-hidden">
          <SareeVisualizer 
            sareeState={sareeState} 
            isGenerating={isGenerating}
            onGenerate={weaveSaree}
          />
        </div>
        
        {/* Right Panel (50%): Scrollable Controls */}
        <div className="lg:w-1/2 order-1 lg:order-2 overflow-y-auto elegant-scroll bg-background">
          <ControlPanel 
            sareeState={sareeState} 
            updatePart={updatePart}
            onGenerate={weaveSaree}
          />
        </div>
      </div>
    </div>
  );
};

export default SareeCustomizer;