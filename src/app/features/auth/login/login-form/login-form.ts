import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Button } from '../../../../shared/components/button/button';
import { Input } from '../../../../shared/components/input/input';

@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, Input, RouterLink],
  templateUrl: './login-form.html',
})
export class LoginForm {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  protected readonly loading     = this.authService.loading;
  protected readonly serverError = this.authService.error;

  protected readonly form = this.fb.group({
    identifier: ['', [Validators.required, Validators.maxLength(256)]],
    password:   ['', [Validators.required]],
  });

  private readonly _submitted = signal(false);
  private readonly _formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly identifierError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const c = this.form.get('identifier')!;
    if (!c.invalid) return null;
    if (c.hasError('required')) return 'Informe seu usuário ou e-mail.';
    if (c.hasError('maxlength')) return 'Máximo de 256 caracteres.';
    return null;
  });

  protected readonly passwordError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    return this.form.get('password')!.invalid ? 'Informe sua senha.' : null;
  });

  protected async submit(): Promise<void> {
    this._submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { identifier, password } = this.form.getRawValue();

    try {
      const res = await this.authService.login({
        identifier: identifier!,
        password:   password!,
      });

      if (res.requiresTwoFactor) {
        this.router.navigate(['/login/2fa'], {
          queryParams: { transactionId: res.transactionId },
        });
        return;
      }

      this.router.navigate(['/dashboard']);
    } catch {
      // erro gerenciado pelo authService.error signal
    }
  }
}
