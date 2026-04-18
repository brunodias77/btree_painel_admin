import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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

function usernamePatternValidator(c: AbstractControl): ValidationErrors | null {
  const v = c.value as string;
  if (!v) return null;
  return /^[a-zA-Z0-9_-]+$/.test(v) ? null : { usernamePattern: true };
}

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
  const password = c.parent?.get('password')?.value as string | undefined;
  return c.value && c.value !== password ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, Input, RouterLink],
  templateUrl: './register-form.html',
})
export class RegisterForm {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  protected readonly loading      = this.authService.loading;
  protected readonly serverErrors = this.authService.serverErrors;

  protected readonly form = this.fb.group({
    username:        ['', [Validators.required, Validators.maxLength(256), usernamePatternValidator]],
    email:           ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password:        ['', [Validators.required, Validators.minLength(8), Validators.maxLength(256), passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required, confirmPasswordValidator]],
  });

  private readonly _submitted = signal(false);
  private readonly _formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly usernameError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const c = this.form.get('username')!;
    if (!c.invalid) return null;
    if (c.hasError('required'))       return 'Informe um nome de usuário.';
    if (c.hasError('maxlength'))      return 'Máximo de 256 caracteres.';
    if (c.hasError('usernamePattern')) return 'Use apenas letras, números, hífens e underlines.';
    return null;
  });

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

  protected readonly passwordError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const c = this.form.get('password')!;
    if (!c.invalid) return null;
    if (c.hasError('required'))   return 'Informe uma senha.';
    if (c.hasError('minlength'))  return 'Mínimo de 8 caracteres.';
    if (c.hasError('maxlength'))  return 'Máximo de 256 caracteres.';
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
    if (c.hasError('required')) return 'Confirme sua senha.';
    if (c.hasError('mismatch')) return 'As senhas não coincidem.';
    return null;
  });

  protected async submit(): Promise<void> {
    this._submitted.set(true);
    // revalidate confirmPassword after password may have changed
    this.form.get('confirmPassword')!.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.form.getRawValue();

    try {
      await this.authService.register({ username: username!, email: email!, password: password! });
      this.router.navigate(['/login'], { queryParams: { registered: '1' } });
    } catch {
      // erros gerenciados pelo authService.serverErrors signal
    }
  }
}
