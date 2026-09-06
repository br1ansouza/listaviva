import { Plus } from 'lucide-react';
import { m } from 'motion/react';
import { type FormEvent, useState } from 'react';

import { spring } from '@/lib/motion';

interface ItemComposerProps {
  placeholder: string;
  onAdd: (content: string) => void;
}

export function ItemComposer({ placeholder, onAdd }: ItemComposerProps) {
  const [content, setContent] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setContent('');
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-3"
      style={{ minHeight: 'var(--rule-height)' }}
    >
      <m.button
        type="submit"
        whileTap={{ scale: 0.85 }}
        transition={spring.snappy}
        aria-label="Adicionar item"
        className="grid size-[22px] shrink-0 place-items-center rounded-md border border-dashed border-ink/30 text-ink-faint"
      >
        <Plus className="size-3.5" strokeWidth={3} />
      </m.button>

      <input
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        maxLength={500}
        className="w-full bg-transparent text-[0.95rem] leading-[var(--rule-height)] text-ink outline-none placeholder:text-ink-faint"
      />
    </form>
  );
}
