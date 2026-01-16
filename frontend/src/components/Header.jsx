import { Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full"></div>
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-gold">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                Threads of Nenapu
              </h1>
              <p className="text-xs text-muted-foreground font-light tracking-wide">
                Craft Your Legacy in Silk
              </p>
            </div>
          </div>
          
          {/* Tagline */}
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground italic">
              "Weaving memories, one thread at a time"
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;