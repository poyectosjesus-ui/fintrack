// Minimal className utility for Shadcn emulation
// This replaces clsx + twMerge without introducing new npm dependencies
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).map(x => (x as string).trim()).join(' ');
}
