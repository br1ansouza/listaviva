import { cn } from '@/lib/utils';

interface MarkProps {
  className?: string;
  animated?: boolean;
  title?: string;
}

export function Mark({ className, animated = false, title = 'ListaViva' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-label={title}
      className={cn('h-8 w-8', animated && 'listaviva-mark-animated', className)}
    >
      <g>
        <path
          className="listaviva-mark-first"
          d="m104 270 86 86 140-168"
          fill="none"
          stroke="currentColor"
          strokeWidth="52"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="listaviva-mark-second"
          d="m208 270 80 80 126-148"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="52"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
