import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { Button } from '../../../../shared/components/button/button';
import { Input } from '../../../../shared/components/input/input';

function passwordStrengthValidator(c: AbstractControl): ValidationErrors | null {
  const v = c.value as string;
  if (!v) return null;
  const missing: string[] = [];
  if (!/[A-Z]/.test(v)) missing.push('uppercase');
  if (!/[a-z]/.test(v)) missing.push('lowercase');
  if (!/[0-9]/.test(v)) missing.push('digit');
  return missing.length ? { passwordStrength: missing } : null;
}

function confirmPasswordValidator(c: AbstractControl): ValidationErrors | null {
  const password = c.parent?.get('newPassword')?.value as string | undefined;
  return c.value && c.value !== password ? { mismatch: true } : null;
}

type Status = 'idle' | 'loading';

@Component({
  selector: 'app-reset-password-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, Input, RouterLink],
  templateUrl: './reset-password-form.html',
})
export class ResetPasswordForm {
  readonly token = input<string>('');

  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  protected readonly form = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(8), Validators.maxLength(256), passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required, confirmPasswordValidator]],
  });

  private readonly _status      = signal<Status>('idle');
  private readonly _submitted   = signal(false);
  private readonly _serverError = signal<string | null>(null);
  private readonly _formValue   = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly isLoading    = computed(() => this._status() === 'loading');
  protected readonly serverError  = this._serverError.asReadonly();
  protected readonly tokenMissing = computed(() => !this.token());

  protected readonly newPasswordError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const c = this.form.get('newPassword')!;
    if (!c.invalid) return null;
    if (c.hasError('required'))  return 'Informe a nova senha.';
    if (c.hasError('minlength')) return 'Mínimo de 8 caracteres.';
    if (c.hasError('maxlength')) return 'Máximo de 256 caracteres.';
    const missing = c.getError('passwordStrength') as string[];
    if (missing?.includes('uppercase')) return 'A senha deve ter ao menos uma letra maiúscula.';
    if (missing?.includes('lowercase')) return 'A senha deve ter ao menos uma letra minúscula.';
    if (missing?.includes('digit'))     return 'A senha deve ter ao menos um número.';
    return null;
  });

  protected readonly confirmPasswordError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const c = this.form.get('confirmPassword')!;
    if (!c.invalid) return null;
    if (c.hasError('required')) return 'Confirme a nova senha.';
    if (c.hasError('mismatch')) return 'As senhas não coincidem.';
    return null;
  });

  protected async submit(): Promise<void> {
    this._submitted.set(true);
    this.form.get('confirmPassword')!.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this._status.set('loading');
    this._serverError.set(null);

    try {
      await this.authService.resetPassword({
        token: this.token(),
        newPassword: this.form.getRawValue().newPassword!,
      });
      this.router.navigate(['/login'], { queryParams: { reset: '1' } });
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
