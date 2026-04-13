import * as React from "react"
import { cn } from "@/lib/cn"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

const variants = {
  default: "bg-indigo-600 text-white hover:bg-indigo-600/90 shadow-md shadow-indigo-600/20",
  destructive: "bg-rose-500 text-white hover:bg-rose-500/90 shadow-md shadow-rose-500/20",
  outline: "border border-zinc-800 bg-transparent hover:bg-zinc-800 hover:text-zinc-100 text-zinc-300",
  secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-800/80",
  ghost: "hover:bg-zinc-800/50 hover:text-zinc-100 text-zinc-400",
  link: "text-indigo-400 underline-offset-4 hover:underline",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8 text-base",
  icon: "h-10 w-10",
};

export const buttonVariants = ({ variant = "default", size = "default", className }: { variant?: keyof typeof variants, size?: keyof typeof sizes, className?: string } = {}) => {
  return cn(baseStyles, variants[variant || "default"], sizes[size || "default"], className);
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    
    // Fallback ignoring asChild since we don't have Radix Slot
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
