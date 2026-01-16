import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartCustomizer from './PartCustomizer';

export const CustomizerPanel = ({ sareeState, updatePart, onGenerate }) => {
  return (
    <div className="h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-primary">
            Customize Your Saree
          </h2>
          <p className="text-muted-foreground">
            Select colors, patterns, and zari work for each part of your saree
          </p>
        </div>
        
        {/* Tabs for Body, Border, Pallu */}
        <Tabs defaultValue="body" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="body" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 text-sm font-medium"
            >
              Body
            </TabsTrigger>
            <TabsTrigger 
              value="border"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 text-sm font-medium"
            >
              Border
            </TabsTrigger>
            <TabsTrigger 
              value="pallu"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 text-sm font-medium"
            >
              Pallu
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="body" className="mt-6">
            <PartCustomizer 
              part="body"
              partState={sareeState.body}
              updatePart={updatePart}
              onGenerate={onGenerate}
            />
          </TabsContent>
          
          <TabsContent value="border" className="mt-6">
            <PartCustomizer 
              part="border"
              partState={sareeState.border}
              updatePart={updatePart}
              onGenerate={onGenerate}
            />
          </TabsContent>
          
          <TabsContent value="pallu" className="mt-6">
            <PartCustomizer 
              part="pallu"
              partState={sareeState.pallu}
              updatePart={updatePart}
              onGenerate={onGenerate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomizerPanel;