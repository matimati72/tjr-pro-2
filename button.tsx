
import * as React from "react";
import { cn } from "./utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "secondary";
  full?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", full, ...props }, ref) => {
    const base = "btn " + (variant === "primary" ? "btn-primary" : "btn-outline");
    const width = full ? " w-full" : "";
    return <button ref={ref} className={cn(base + width, className)} {...props} />;
  }
);
Button.displayName = "Button";
