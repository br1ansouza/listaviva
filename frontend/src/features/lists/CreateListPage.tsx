import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import {
  accentStyle,
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
    <motion.form
      onSubmit={handleSubmit}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: staggerChildren(0.05) } }}
      style={accentStyle(color)}
      className="pt-8"
    >
      <motion.h1 variants={fadeUp} className="hand-title text-4xl text-ink">
        Nova lista
      </motion.h1>

      <motion.div variants={fadeUp} className="mt-6 flex gap-2">
        {LIST_TYPES.map((type) => {
          const selected = type.id === listType;

          return (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => selectType(type.id)}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
              className={cn(
                'flex-1 rounded-2xl border px-4 py-3 text-left transition-colors',
                selected
                  ? 'border-transparent bg-accent-list/70 text-ink'
                  : 'border-hairline bg-surface/50 text-ink-soft hover:text-ink',
              )}
            >
              <span className="block text-sm font-medium">{type.label}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{type.hint}</span>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-6 flex items-center gap-3">
        <IconPicker
          value={icon}
          onChange={(next) => {
            setTouchedIcon(true);
            setIcon(next);
          }}
        />

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título da lista"
          maxLength={120}
          className="hand-title h-12 w-full border-0 border-b border-hairline bg-transparent text-3xl text-ink outline-none placeholder:text-ink-faint focus:border-accent-list"
        />
      </motion.div>

      <motion.div variants={fadeUp} className="mt-8">
        <span className="text-xs font-medium tracking-wide text-ink-faint uppercase">Cor</span>
        <ColorPicker
          value={color}
          onChange={(next) => {
            setTouchedColor(true);
            setColor(next);
          }}
          className="mt-3"
        />
      </motion.div>

      <motion.button
        variants={fadeUp}
        type="submit"
        disabled={saving}
        className="mt-10 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[0.95rem] font-medium text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        {saving ? 'Criando...' : 'Criar lista'}
      </motion.button>
    </motion.form>
  );
}
