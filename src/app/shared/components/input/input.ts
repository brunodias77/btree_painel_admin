import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'search';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label [for]="id()" class="block text-sm font-medium text-zinc-700 mb-1.5">
        {{ label() }}
      </label>
    }

    <div class="relative">
      <input
        [id]="id()"
        [type]="effectiveType()"
        [placeholder]="placeholder()"
        [value]="_value()"
        [disabled]="_disabled()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="error() ? id() + '-error' : null"
        [class]="inputClass()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />

      @if (showPasswordToggle() && type() === 'password') {
        <button
          type="button"
          (click)="togglePassword()"
          class="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-600 transition-colors"
          [attr.aria-label]="_showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
        >
          @if (_showPassword()) {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
            </svg>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        </button>
      }
    </div>

    @if (error()) {
      <p [id]="id() + '-error'" class="mt-1.5 text-xs text-red-600" role="alert">
        {{ error() }}
      </p>
    }
  `,
})
export class Input implements ControlValueAccessor {
  readonly id                  = input('');
  readonly type                = input<InputType>('text');
  readonly placeholder         = input('');
  readonly label               = input('');
  readonly error               = input<string | null>(null);
  readonly showPasswordToggle  = input(false, { transform: booleanAttribute });

  protected readonly _value       = signal('');
  protected readonly _disabled    = signal(false);
  protected readonly _showPassword = signal(false);

  protected readonly effectiveType = computed(() =>
    this.type() === 'password' && this._showPassword() ? 'text' : this.type(),
  );

  protected readonly inputClass = computed(() => [
    'w-full rounded-lg border text-sm text-zinc-900 placeholder-zinc-400',
    'outline-none transition',
    'focus:ring-2 focus:ring-zinc-900 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    this.showPasswordToggle() && this.type() === 'password' ? 'px-3.5 py-2.5 pr-10' : 'px-3.5 py-2.5',
    this.error()
      ? 'border-red-400 bg-red-50'
      : 'border-zinc-300 bg-white hover:border-zinc-400',
  ].join(' '));

  private _onChange: (v: string) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(value: string): void {
    this._value.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this._disabled.set(disabled);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this._value.set(value);
    this._onChange(value);
  }

  protected onBlur(): void {
    this._onTouched();
  }

  protected togglePassword(): void {
    this._showPassword.update(v => !v);
  }
}
