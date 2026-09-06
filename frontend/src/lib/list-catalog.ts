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
  Lightbulb,
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

export type ListTypeId = 'todo' | 'shopping' | 'event' | 'meals' | 'ideas';

export interface ListTypeDefinition {
  id: ListTypeId;
  label: string;
  hint: string;
  defaultIcon: ListIconId;
  defaultColor: ListColor;
  itemPlaceholder: string;
  titlePlaceholder: string;
}

export const LIST_COLORS: {
  id: ListColor;
  label: string;
  token: string;
  softToken: string;
}[] = [
  {
    id: 'coral',
    label: 'Coral',
    token: 'var(--list-coral)',
    softToken: 'var(--list-coral-soft)',
  },
  {
    id: 'mint',
    label: 'Menta',
    token: 'var(--list-mint)',
    softToken: 'var(--list-mint-soft)',
  },
  {
    id: 'lavender',
    label: 'Violeta',
    token: 'var(--list-lavender)',
    softToken: 'var(--list-lavender-soft)',
  },
  {
    id: 'butter',
    label: 'Âmbar',
    token: 'var(--list-butter)',
    softToken: 'var(--list-butter-soft)',
  },
  {
    id: 'sky',
    label: 'Azul',
    token: 'var(--list-sky)',
    softToken: 'var(--list-sky-soft)',
  },
  {
    id: 'blush',
    label: 'Rosa',
    token: 'var(--list-blush)',
    softToken: 'var(--list-blush-soft)',
  },
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
  lightbulb: Lightbulb,
} satisfies Record<string, LucideIcon>;

export type ListIconId = keyof typeof LIST_ICONS;

export const LIST_ICON_IDS = Object.keys(LIST_ICONS) as ListIconId[];

export const LIST_TYPES: ListTypeDefinition[] = [
  {
    id: 'todo',
    label: 'Tarefas',
    hint: 'Pendências e rotina',
    defaultIcon: 'list-todo',
    defaultColor: 'sky',
    itemPlaceholder: 'O que precisa ser feito?',
    titlePlaceholder: 'Ex.: Coisas de hoje',
  },
  {
    id: 'shopping',
    label: 'Compras',
    hint: 'Mercado, feira e mais',
    defaultIcon: 'shopping-cart',
    defaultColor: 'mint',
    itemPlaceholder: 'O que falta comprar?',
    titlePlaceholder: 'Ex.: Mercado da semana',
  },
  {
    id: 'event',
    label: 'Evento',
    hint: 'Festa, rolê ou encontro',
    defaultIcon: 'party',
    defaultColor: 'blush',
    itemPlaceholder: 'O que falta combinar?',
    titlePlaceholder: 'Ex.: Aniversário da Ana',
  },
  {
    id: 'meals',
    label: 'Refeições',
    hint: 'Cardápio e pedidos',
    defaultIcon: 'utensils',
    defaultColor: 'butter',
    itemPlaceholder: 'O que vai ter?',
    titlePlaceholder: 'Ex.: Almoço de domingo',
  },
  {
    id: 'ideas',
    label: 'Ideias',
    hint: 'Planos e referências',
    defaultIcon: 'lightbulb',
    defaultColor: 'lavender',
    itemPlaceholder: 'Qual é a próxima ideia?',
    titlePlaceholder: 'Ex.: Próximo projeto',
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
  const definition = LIST_COLORS.find((item) => item.id === color);

  return {
    ['--accent-list' as string]: definition?.token ?? `var(--list-${FALLBACK_COLOR})`,
    ['--accent-list-soft' as string]: definition?.softToken ?? `var(--list-${FALLBACK_COLOR}-soft)`,
  };
}
