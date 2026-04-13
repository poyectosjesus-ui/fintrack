import * as Icons from 'lucide-react';
import { LucideIcon, Hash, ShoppingCart, Tv, Car, Utensils, Receipt, Home, Beer, Wallet, Target, Plane, Laptop, Banknote, Coffee, Dumbbell } from 'lucide-react';

const emojiToLucide: Record<string, LucideIcon> = {
  '🛒': ShoppingCart,
  '🍿': Tv,
  '🚗': Car,
  '🍔': Utensils,
  '🍕': Utensils,
  '🏠': Home,
  '🍻': Beer,
  '🏦': Banknote,
  '✈️': Plane,
  '💻': Laptop,
  '☕️': Coffee,
  '💪': Dumbbell,
  '💰': Wallet,
  '🎯': Target,
  '🧾': Receipt
};

export function getLucideIcon(identifier: string): LucideIcon {
  if (!identifier) return Hash;
  
  // Si es un emoji mapeado explícitamente
  if (emojiToLucide[identifier]) {
    return emojiToLucide[identifier];
  }
  
  // Si traen un identificador de lucide directo como "ShoppingCart"
  const NamedIcon = (Icons as any)[identifier];
  if (NamedIcon) return NamedIcon;

  // Fallback
  return Hash;
}
