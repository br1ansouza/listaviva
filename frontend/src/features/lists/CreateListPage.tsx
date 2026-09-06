import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { m } from 'motion/react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import {
  accentStyle,
  iconById,
  LIST_TYPES,
  type ListColor,
  type ListIconId,
  type ListTypeId,
  listTypeById,
} from '@/lib/list-catalog';
import { fadeUp, spring, staggerChildren } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';

export function CreateListPage() {
  const navigate = useNavigate();
  const [listType, setListType] = useState<ListTypeId>('todo');
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<ListIconId>(listTypeById('todo').defaultIcon);
  const [color, setColor] = useState<ListColor>(listTypeById('todo').defaultColor);
  const [touchedIcon, setTouchedIcon] = useState(false);
  const [touchedColor, setTouchedColor] = useState(false);
  const [saving, setSaving] = useState(false);
  const definition = listTypeById(listType);

  function selectType(next: ListTypeId) {
    const definition = listTypeById(next);
    setListType(next);
    if (!touchedIcon) setIcon(definition.defaultIcon);
    if (!touchedColor) setColor(definition.defaultColor);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;

    const trimmed = title.trim();
    if (!trimmed) {
      toast.error('Dê um nome para a lista.');
      return;
    }

    setSaving(true);

    try {
      const list = await api.createList({ title: trimmed, list_type: listType, icon, color });
      navigate(`/lista/${list.id}`);
    } catch {
      toast.error('Não deu para criar agora. Tente de novo em instantes.');
      setSaving(false);
    }
  }

  return (
    <m.form
      onSubmit={handleSubmit}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: staggerChildren(0.05) } }}
      style={accentStyle(color)}
      className="py-6 sm:py-9"
    >
      <m.div variants={fadeUp}>
        <h1 className="hand-title text-4xl text-ink sm:text-5xl">Nova lista</h1>
        <p className="mt-2 text-sm text-ink-soft">Escolha um tipo e dê um nome para começar.</p>
      </m.div>

      <m.div variants={fadeUp} className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {LIST_TYPES.map((type) => {
          const selected = type.id === listType;
          const TypeIcon = iconById(type.defaultIcon);

          return (
            <m.button
              key={type.id}
              type="button"
              aria-pressed={selected}
              onClick={() => selectType(type.id)}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
              style={accentStyle(type.defaultColor)}
              className={cn(
                'relative flex h-12 items-center gap-2 rounded-xl border px-3 text-left transition-[border-color,background-color,box-shadow,color]',
                selected
                  ? 'border-accent-list bg-accent-list text-accent-list-foreground shadow-[0_6px_18px_color-mix(in_oklab,var(--accent-list)_22%,transparent)]'
                  : 'border-hairline bg-surface/75 text-ink-soft hover:border-ink/25 hover:bg-surface',
              )}
            >
              <TypeIcon className="size-[17px] shrink-0" strokeWidth={2.25} />
              <span className="truncate text-xs font-semibold">{type.label}</span>
              {selected ? <Check className="ml-auto size-3.5 shrink-0" strokeWidth={3} /> : null}
            </m.button>
          );
        })}
      </m.div>

      <m.div
        variants={fadeUp}
        className="mt-5 overflow-hidden rounded-[1.25rem] border border-hairline bg-surface shadow-sm"
      >
        <div className="h-1 bg-accent-list" />
        <div className="flex items-center gap-3 px-4 pt-5 sm:px-5">
          <IconPicker
            value={icon}
            onChange={(next) => {
              setTouchedIcon(true);
              setIcon(next);
            }}
          />

          <label className="min-w-0 flex-1">
            <span className="sr-only">Título da lista</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={definition.titlePlaceholder}
              maxLength={120}
              className="hand-title h-12 w-full border-0 border-b border-hairline bg-transparent text-3xl text-ink outline-none transition-colors placeholder:text-ink-faint/75 focus:border-accent-list"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-4 py-4 sm:px-5">
          <span className="text-xs font-medium text-ink-soft">Cor da capa</span>
          <ColorPicker
            value={color}
            onChange={(next) => {
              setTouchedColor(true);
              setColor(next);
            }}
          />
        </div>
      </m.div>

      <m.button
        variants={fadeUp}
        type="submit"
        disabled={saving}
        className="primary-action mt-5 w-full px-7"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {saving ? 'Criando...' : 'Criar e adicionar itens'}
      </m.button>
    </m.form>
  );
}
