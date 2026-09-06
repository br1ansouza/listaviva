import {
  Backpack,
  Beer,
  Briefcase,
  Cake,
  CalendarCheck,
  CheckSquare,
  Dumbbell,
  Gift,
  Heart,
  Home,
  Landmark,
  ListTodo,
  type LucideIcon,
  Palmtree,
  PartyPopper,
  PawPrint,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sun,
  Utensils,
  Wrench,
} from 'lucide-react';

export type ListColor = 'coral' | 'mint' | 'lavender' | 'butter' | 'sky' | 'blush';

export type ListTypeId = 'todo' | 'shopping';

export interface ListTypeDefinition {
  id: ListTypeId;
  label: string;
  hint: string;
  defaultIcon: ListIconId;
  defaultColor: ListColor;
  itemPlaceholder: string;
}

export const LIST_COLORS: { id: ListColor; label: string; token: string }[] = [
  { id: 'coral', label: 'Coral', token: 'var(--list-coral)' },
  { id: 'mint', label: 'Menta', token: 'var(--list-mint)' },
  { id: 'lavender', label: 'Lavanda', token: 'var(--list-lavender)' },
  { id: 'butter', label: 'Manteiga', token: 'var(--list-butter)' },
  { id: 'sky', label: 'Céu', token: 'var(--list-sky)' },
  { id: 'blush', label: 'Blush', token: 'var(--list-blush)' },
];

export const LIST_ICONS = {
  'check-square': CheckSquare,
  'list-todo': ListTodo,
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  plane: Plane,
  palmtree: Palmtree,
  sun: Sun,
  home: Home,
  gift: Gift,
  heart: Heart,
  party: PartyPopper,
  cake: Cake,
  utensils: Utensils,
  beer: Beer,
  dumbbell: Dumbbell,
  backpack: Backpack,
  briefcase: Briefcase,
  wrench: Wrench,
  'paw-print': PawPrint,
  landmark: Landmark,
  'calendar-check': CalendarCheck,
  sparkles: Sparkles,
} satisfies Record<string, LucideIcon>;

export type ListIconId = keyof typeof LIST_ICONS;

export const LIST_ICON_IDS = Object.keys(LIST_ICONS) as ListIconId[];

export const LIST_TYPES: ListTypeDefinition[] = [
  {
    id: 'todo',
    label: 'To-do',
    hint: 'Tarefas para riscar',
    defaultIcon: 'list-todo',
    defaultColor: 'sky',
    itemPlaceholder: 'O que precisa ser feito?',
  },
  {
    id: 'shopping',
    label: 'Compras',
    hint: 'Mercado e feira',
    defaultIcon: 'shopping-cart',
    defaultColor: 'mint',
    itemPlaceholder: 'O que falta comprar?',
  },
];

const FALLBACK_ICON: ListIconId = 'check-square';
const FALLBACK_COLOR: ListColor = 'mint';

export function listTypeById(id: string): ListTypeDefinition {
  return LIST_TYPES.find((type) => type.id === id) ?? (LIST_TYPES[0] as ListTypeDefinition);
}

export function iconById(id: string): LucideIcon {
  return LIST_ICONS[id as ListIconId] ?? LIST_ICONS[FALLBACK_ICON];
}

export function colorToken(id: string): string {
  return LIST_COLORS.find((color) => color.id === id)?.token ?? `var(--list-${FALLBACK_COLOR})`;
}

export function accentStyle(color: string): React.CSSProperties {
  return { ['--accent-list' as string]: colorToken(color) };
}
