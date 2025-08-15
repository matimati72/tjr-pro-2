
import * as React from "react";
interface SliderProps {
  min?: number; max?: number; step?: number; value: number[];
  onValueChange?: (v: number[]) => void;
}
export function Slider({ min=0, max=100, step=1, value, onValueChange }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e)=> onValueChange?.([Number(e.target.value)])}
      className="w-full"
    />
  );
}
