import { Toaster } from '@/components/ui/sonner';
import SareeCustomizer from '@/components/SareeCustomizer';
import '@/App.css';

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <SareeCustomizer />
      <Toaster />
    </div>
  );
}

export default App;