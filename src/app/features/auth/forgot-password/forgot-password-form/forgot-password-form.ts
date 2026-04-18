import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Button } from '../../../../shared/components/button/button';
import { Input } from '../../../../shared/components/input/input';

type Status = 'idle' | 'loading' | 'success';

@Component({
  selector: 'app-forgot-password-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, Input, RouterLink],
  templateUrl: './forgot-password-form.html',
})
export class ForgotPasswordForm {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
  });

  private readonly _status      = signal<Status>('idle');
  private readonly _submitted   = signal(false);
  private readonly _serverError = signal<string | null>(null);
  private readonly _formValue   = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly isLoading = computed(() => this._status() === 'loading');
  protected readonly isSuccess = computed(() => this._status() === 'success');

  protected readonly emailError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const c = this.form.get('email')!;
    if (!c.invalid) return null;
    if (c.hasError('required')) return 'Informe seu e-mail.';
    if (c.hasError('email'))    return 'Informe um e-mail válido.';
    if (c.hasError('maxlength')) return 'Máximo de 256 caracteres.';
    return null;
  });

  protected readonly serverError = this._serverError.asReadonly();

  protected async submit(): Promise<void> {
    this._submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this._status.set('loading');
    this._serverError.set(null);

    try {
      await this.authService.forgotPassword({ email: this.form.getRawValue().email! });
      this._status.set('success');
    } catch (err: unknown) {
      this._serverError.set(extractErrorMessage(err));
      this._status.set('idle');
    }
  }
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error: unknown }).error;
    if (body && typeof body === 'object' && 'message' in body) {
      return String((body as { message: string }).message);
    }
  }
  return 'Ocorreu um erro. Tente novamente.';
}
