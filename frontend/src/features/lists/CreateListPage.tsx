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
import { ListHistory } from './ListHistory';

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
    <div className="lg:grid lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <m.form
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: staggerChildren(0.05) } }}
        style={accentStyle(color)}
        className="min-w-0 pt-6 sm:pt-9 lg:pt-6"
      >
        <m.div variants={fadeUp}>
          <p className="section-label mb-3">Um começo organizado</p>
          <h1 className="page-title text-ink">Nova lista</h1>
          <p className="mt-2 text-sm text-ink-soft">Escolha um tipo e dê um nome para começar.</p>
        </m.div>

        <m.div variants={fadeUp} className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:gap-1.5">
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
                  'relative flex min-h-14 items-center gap-2 rounded-xl border px-3 text-left transition-[border-color,background-color,box-shadow,color] lg:flex-col lg:justify-center lg:gap-2 lg:px-1 lg:py-3',
                  selected
                    ? 'border-accent-list/60 bg-accent-list-soft text-ink'
                    : 'border-hairline bg-surface/75 text-ink-soft hover:border-ink/25 hover:bg-surface',
                )}
              >
                <TypeIcon
                  className={cn('size-[17px] shrink-0', selected && 'text-accent-list')}
                  strokeWidth={2.25}
                />
                <span className="truncate text-xs font-semibold">{type.label}</span>
                {selected ? (
                  <Check
                    className="ml-auto size-3.5 shrink-0 text-accent-list lg:absolute lg:top-1.5 lg:right-1.5 lg:size-3"
                    strokeWidth={3}
                  />
                ) : null}
              </m.button>
            );
          })}
        </m.div>

        <m.div
          variants={fadeUp}
          className="mt-5 overflow-hidden rounded-[1.25rem] border border-hairline bg-surface"
        >
          <div className="h-[3px] bg-accent-list" />
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

      <ListHistory variant="embedded" />
    </div>
  );
}
