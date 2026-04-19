import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Button } from '../../../shared/components/button/button';
import { Input } from '../../../shared/components/input/input';

type Status = 'idle' | 'loading' | 'success' | 'error';

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error: unknown }).error;
    if (body && typeof body === 'object' && 'message' in body) {
      return String((body as { message: string }).message);
    }
  }
  return 'Erro ao verificar o e-mail. Tente novamente.';
}

@Component({
  selector: 'app-verify-email-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Button, Input],
  templateUrl: './verify-email-page.html',
})
export class VerifyEmailPage {
  private readonly authService = inject(AuthService);
  private readonly fb          = inject(FormBuilder);

  // Bound automatically from ?token=... via withComponentInputBinding()
  readonly token = input<string>('');

  protected readonly form = this.fb.group({
    token: ['', [Validators.required, Validators.minLength(10)]],
  });

  private readonly _status       = signal<Status>('idle');
  protected readonly _errorMessage = signal<string | null>(null);

  protected readonly isLoading = computed(() => this._status() === 'loading');
  protected readonly isSuccess = computed(() => this._status() === 'success');
  protected readonly isError   = computed(() => this._status() === 'error');

  protected readonly tokenError = computed(() => {
    const c = this.form.get('token')!;
    if (!c.invalid || !c.touched) return null;
    if (c.hasError('required'))   return 'Cole o token recebido no e-mail.';
    if (c.hasError('minlength'))  return 'Token inválido.';
    return null;
  });

  protected readonly currentYear = new Date().getFullYear();

  constructor() {
    // If token arrives via URL query param: pre-fill and auto-submit
    effect(() => {
      const urlToken = this.token();
      if (urlToken) {
        this.form.patchValue({ token: urlToken });
        void this.verify(urlToken);
      }
    });
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    await this.verify(this.form.getRawValue().token!.trim());
  }

  protected retry(): void {
    this._status.set('idle');
    this._errorMessage.set(null);
  }

  private async verify(token: string): Promise<void> {
    this._status.set('loading');
    this._errorMessage.set(null);
    try {
      await this.authService.verifyEmail(token);
      this._status.set('success');
    } catch (err: unknown) {
      this._errorMessage.set(extractErrorMessage(err));
      this._status.set('error');
    }
  }
}
