import {
  Truck, ShieldCheck, Headphones, RotateCcw, BadgeCheck, Phone, Clock, Gift, CreditCard, Percent, Star, Zap, Flame,
  Package, Heart, Sparkles, LayoutGrid, UtensilsCrossed, CookingPot, Cpu, Watch, Smartphone, Laptop, Tv, Home, Shirt,
  Camera, Gamepad2, Fan, Lamp, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  Truck, ShieldCheck, Headphones, RotateCcw, BadgeCheck, Phone, Clock, Gift, CreditCard, Percent, Star, Zap, Flame,
  Package, Heart, Sparkles, LayoutGrid, UtensilsCrossed, CookingPot, Cpu, Watch, Smartphone, Laptop, Tv, Home, Shirt,
  Camera, Gamepad2, Fan, Lamp,
};

export function Icon({ name, className }: { name?: string; className?: string }) {
  const C = (name && MAP[name]) || Package;
  return <C className={className} aria-hidden="true" />;
}
