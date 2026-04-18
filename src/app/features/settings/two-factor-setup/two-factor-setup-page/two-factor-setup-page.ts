import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import QRCode from 'qrcode';
import { AuthService } from '../../../../core/services/auth.service';
import { Button } from '../../../../shared/components/button/button';

type Step = 'idle' | 'scanning' | 'success';

interface SetupData {
  setupTokenId: string;
  secret: string;
  qrDataUrl: string;
}

@Component({
  selector: 'app-two-factor-setup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, RouterLink],
  templateUrl: './two-factor-setup-page.html',
})
export class TwoFactorSetupPage {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly loading     = this.authService.loading;
  protected readonly serverError = this.authService.error;

  protected readonly _step      = signal<Step>('idle');
  protected readonly _setupData = signal<SetupData | null>(null);
  protected readonly _submitted = signal(false);
  protected readonly _secretVisible = signal(false);

  protected readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  private readonly _formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly isIdle     = computed(() => this._step() === 'idle');
  protected readonly isScanning = computed(() => this._step() === 'scanning');
  protected readonly isSuccess  = computed(() => this._step() === 'success');

  protected readonly codeError = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const c = this.form.get('code')!;
    if (!c.invalid) return null;
    if (c.hasError('required')) return 'Informe o código de 6 dígitos.';
    if (c.hasError('pattern'))  return 'O código deve conter exatamente 6 dígitos numéricos.';
    return null;
  });

  protected async startSetup(): Promise<void> {
    try {
      const res = await this.authService.setupTwoFactor();
      const qrDataUrl = await QRCode.toDataURL(res.qr_code_uri, {
        width: 192,
        margin: 1,
        color: { dark: '#18181b', light: '#ffffff' },
      });
      this._setupData.set({
        setupTokenId: res.setup_token_id,
        secret: res.secret,
        qrDataUrl,
      });
      this._step.set('scanning');
    } catch {
      // erro gerenciado pelo authService.error signal
    }
  }

  protected async confirm(): Promise<void> {
    this._submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this._setupData();
    if (!data) return;

    try {
      await this.authService.enableTwoFactor(data.setupTokenId, this.form.getRawValue().code!);
      this._step.set('success');
    } catch {
      // erro gerenciado pelo authService.error signal
    }
  }

  protected toggleSecretVisibility(): void {
    this._secretVisible.update(v => !v);
  }

  protected readonly benefits = [
    { text: 'Protege sua conta mesmo que sua senha seja comprometida' },
    { text: 'Código de 6 dígitos renovado a cada 30 segundos' },
    { text: 'Compatível com todos os principais apps autenticadores' },
  ];
}
