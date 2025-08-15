
import * as React from "react";
export function Switch({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange?: (v:boolean)=>void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e)=>onCheckedChange?.(e.target.checked)}
        className="sr-only"
      />
      <span className={"inline-block w-10 h-6 rounded-full transition " + (checked ? "bg-emerald-500" : "bg-slate-300")}>
        <span className={"block w-5 h-5 bg-white rounded-full translate-y-0.5 transition " + (checked ? "translate-x-5" : "translate-x-0.5")} />
      </span>
    </label>
  );
}
