import React from 'react';
import {
  BadgeCheck, CheckCircle2, Clock, CookingPot, Cpu, CreditCard, Flame, Gift, Headphones, Heart, Home,
  Laptop, LayoutGrid, MapPin, Package, PackageCheck, Phone, RotateCcw, ShieldCheck, ShoppingBag,
  Smartphone, Sparkles, Star, Tag, Truck, Tv, UtensilsCrossed, Wallet, Watch, Zap, Camera, Gamepad2,
  Shirt, Baby, Dumbbell, Lamp, Refrigerator, WashingMachine, Speaker, Plug, Leaf, Coffee,
  type LucideProps,
} from 'lucide-react';

/**
 * Icons selectable in WordPress (Gorom Deal > Categories / Settings).
 * Keep this list in sync with GD_ICONS in the plugin (includes/class-gd-fields.php).
 */
export const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  BadgeCheck, CheckCircle2, Clock, CookingPot, Cpu, CreditCard, Flame, Gift, Headphones, Heart, Home,
  Laptop, LayoutGrid, MapPin, Package, PackageCheck, Phone, RotateCcw, ShieldCheck, ShoppingBag,
  Smartphone, Sparkles, Star, Tag, Truck, Tv, UtensilsCrossed, Wallet, Watch, Zap, Camera, Gamepad2,
  Shirt, Baby, Dumbbell, Lamp, Refrigerator, WashingMachine, Speaker, Plug, Leaf, Coffee,
};

export const DynamicIcon: React.FC<{ name?: string } & LucideProps> = ({ name, ...props }) => {
  const Icon = (name && ICONS[name]) || LayoutGrid;
  return <Icon {...props} />;
};
