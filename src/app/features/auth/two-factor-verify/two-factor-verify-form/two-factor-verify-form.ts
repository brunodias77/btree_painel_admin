import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-two-factor-verify-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, RouterLink],
  templateUrl: './two-factor-verify-form.html',
})
export class TwoFactorVerifyForm {
  readonly transactionId = input<string>('');

  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  protected readonly loading     = this.authService.loading;
  protected readonly serverError = this.authService.error;

  protected readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  private readonly _submitted = signal(false);
  private readonly _formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly missingTransaction = computed(() => !this.transactionId());

  protected readonly codeError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const c = this.form.get('code')!;
    if (!c.invalid) return null;
    if (c.hasError('required')) return 'Informe o código de 6 dígitos.';
    if (c.hasError('pattern'))  return 'O código deve conter exatamente 6 dígitos numéricos.';
    return null;
  });

  protected async submit(): Promise<void> {
    this._submitted.set(true);

    if (this.form.invalid || !this.transactionId()) return;

    try {
      await this.authService.verifyTwoFactor(
        this.transactionId(),
        this.form.getRawValue().code!,
      );
      this.router.navigate(['/dashboard']);
    } catch {
      // erro gerenciado pelo authService.error signal
    }
  }
}
