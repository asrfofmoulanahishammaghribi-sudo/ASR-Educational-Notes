"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const hslToCss = (hslString: string) => `hsl(${hslString})`;

export function ColorPicker({ colors, selectedColor, onSelectColor }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Select color ${color}`}
          onClick={() => onSelectColor(color)}
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
            selectedColor === color ? "border-ring" : "border-transparent hover:border-muted-foreground/50"
          )}
          style={{ backgroundColor: hslToCss(color) }}
        >
          {selectedColor === color && <Check className="w-5 h-5 text-white" style={{ mixBlendMode: 'difference' }} />}
        </button>
      ))}
    </div>
  );
}
