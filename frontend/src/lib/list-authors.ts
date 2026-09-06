import type { CSSProperties } from 'react';

import type { ListItemPayload } from './api';
import { LIST_COLORS } from './list-catalog';

export function listAuthors(items: ListItemPayload[], listColor: string) {
  const ids = [
    ...new Set(
      items.flatMap((item) => (item.created_by_device_id ? [item.created_by_device_id] : [])),
    ),
  ].sort();
  const bannerColor = LIST_COLORS.some((color) => color.id === listColor) ? listColor : 'mint';
  const palette = LIST_COLORS.filter((color) => color.id !== bannerColor);
  const used = new Set<string>();

  return new Map(
    ids.map((id, index) => {
      const hash = [...id].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
      const available = palette.filter((color) => !used.has(color.id));
      const choices = available.length ? available : palette;
      const color = choices[hash % choices.length];
      if (color) used.add(color.id);

      return [
        id,
        {
          fallbackName: `Pessoa ${index + 1}`,
          style: {
            '--author-color': color?.token,
            '--author-background': color?.softToken,
          } as CSSProperties,
        },
      ] as const;
    }),
  );
}
