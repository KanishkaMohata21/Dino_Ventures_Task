import { ThemeToggle } from "./ThemeToggle";
import { Play } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Play size={16} className="text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">DinoPlay</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
