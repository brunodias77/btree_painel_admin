import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800 focus:ring-zinc-900',
  secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 focus:ring-zinc-400',
  ghost:     'bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 focus:ring-zinc-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
};

const SIZES: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
};

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClass()"
    >
      @if (loading()) {
        <svg
          class="w-4 h-4 animate-spin shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      }
      <ng-content />
    </button>
  `,
})
export class Button {
  readonly type     = input<'button' | 'submit' | 'reset'>('button');
  readonly variant  = input<Variant>('primary');
  readonly size     = input<Size>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading  = input(false, { transform: booleanAttribute });
  readonly block    = input(false, { transform: booleanAttribute });

  protected readonly buttonClass = computed(() => [
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    this.block() ? 'w-full' : '',
    VARIANTS[this.variant()],
    SIZES[this.size()],
  ].join(' '));
}
