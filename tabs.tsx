
"use client";
import * as React from "react";
type TabsContextType = { value: string; setValue: (v:string)=>void };
const TabsCtx = React.createContext<TabsContextType | null>(null);
export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [value, setValue] = React.useState(defaultValue);
  return <TabsCtx.Provider value={{ value, setValue }}>{children}</TabsCtx.Provider>;
}
export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-2 rounded-xl border p-1 bg-white">{children}</div>;
}
export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)!;
  const active = ctx.value === value;
  return (
    <button
      onClick={()=>ctx.setValue(value)}
      className={"px-3 py-2 text-sm rounded-xl " + (active ? "bg-slate-900 text-white" : "bg-white text-slate-700")}
    >{children}</button>
  );
}
export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)!;
  if (ctx.value !== value) return null;
  return <div className="mt-3">{children}</div>;
}
