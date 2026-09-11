import { ArrowRight, Check, Loader2, Trash2 } from 'lucide-react';
import { m } from 'motion/react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ApiError,
  api,
  type ListDraft,
  type ListReplacement,
  MAX_LIST_TITLE_LENGTH,
} from '@/lib/api';
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
  const [replacement, setReplacement] = useState<ListReplacement | null>(null);
  const [pendingDraft, setPendingDraft] = useState<ListDraft | null>(null);
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

    const draft = { title: trimmed, list_type: listType, icon, color };
    setPendingDraft(draft);
    await create(draft);
  }

  async function create(draft: ListDraft, confirmedReplacement?: ListReplacement) {
    if (saving) return;
    setSaving(true);
    try {
      const list = await api.createList(draft, confirmedReplacement);
      if (confirmedReplacement) toast.success('Lista antiga excluída. Nova lista criada.');
      navigate(`/lista/${list.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.oldestList) {
        setReplacement(error.oldestList);
        if (confirmedReplacement) {
          toast.info('A lista antiga mudou. Confira os dados antes de confirmar novamente.');
        }
      } else {
        setReplacement(null);
        toast.error(
          error instanceof ApiError && error.status === 429
            ? 'Muitas tentativas de criação. Aguarde um pouco antes de tentar novamente.'
            : confirmedReplacement
              ? 'Não foi possível confirmar a criação. Confira seu histórico antes de tentar novamente.'
              : 'Não deu para criar agora. Tente de novo em instantes.',
        );
      }
    } finally {
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
                maxLength={MAX_LIST_TITLE_LENGTH}
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

      <Dialog
        open={replacement !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setReplacement(null);
        }}
      >
        <DialogContent showCloseButton={!saving} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dar espaço para uma nova lista?</DialogTitle>
            <DialogDescription>
              Você atingiu o limite de 30 listas neste dispositivo. Para criar outra, pode excluir a
              mais antiga. Nada será apagado sem sua confirmação.
            </DialogDescription>
          </DialogHeader>
          {replacement ? (
            <div className="min-w-0 rounded-xl border border-hairline bg-muted/50 px-4 py-3">
              <p className="break-words text-sm font-semibold text-ink">{replacement.title}</p>
              <p className="mt-1 text-xs text-ink-soft">
                Criada em {new Date(replacement.created_at).toLocaleDateString('pt-BR')} ·{' '}
                {replacement.items_count} {replacement.items_count === 1 ? 'item' : 'itens'}
              </p>
            </div>
          ) : null}
          <p className="text-sm text-ink-soft">
            A lista e todos os seus itens serão excluídos permanentemente, inclusive para quem
            recebeu o link. Essa ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <button
              type="button"
              disabled={saving}
              onClick={() => setReplacement(null)}
              className="min-h-11 rounded-xl border border-hairline px-4 text-sm font-medium text-ink transition-colors hover:bg-muted disabled:opacity-50"
            >
              Manter minhas listas
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                if (pendingDraft && replacement) void create(pendingDraft, replacement);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {saving ? 'Substituindo...' : 'Excluir e criar nova'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
