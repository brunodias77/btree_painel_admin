import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import { Button } from '../../../../shared/components/button/button';
import { Input } from '../../../../shared/components/input/input';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, Input, RouterLink],
  templateUrl: './login-form.html',
})
export class LoginForm {
  private readonly fb                = inject(FormBuilder);
  private readonly authService       = inject(AuthService);
  private readonly googleAuthService = inject(GoogleAuthService);
  private readonly router            = inject(Router);
  private readonly ngZone            = inject(NgZone);

  protected readonly loading      = this.authService.loading;
  protected readonly serverError  = this.authService.error;
  protected readonly socialError  = signal<string | null>(null);
  protected readonly googleClientId = environment.googleClientId;

  protected readonly form = this.fb.group({
    identifier: ['', [Validators.required, Validators.maxLength(256)]],
    password:   ['', [Validators.required]],
  });

  private readonly _submitted = signal(false);
  private readonly _formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  private readonly googleButtonContainer =
    viewChild<ElementRef<HTMLDivElement>>('googleButtonContainer');

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

  constructor() {
    afterNextRender(() => {
      const el = this.googleButtonContainer()?.nativeElement;
      if (!el || !environment.googleClientId) return;
      this.googleAuthService
        .renderSignInButton(el, environment.googleClientId, (token) => {
          this.ngZone.run(() => this.handleGoogleToken(token));
        })
        .catch(() => {
          this.socialError.set('Não foi possível carregar o login com Google.');
        });
    });
  }

  private async handleGoogleToken(idToken: string): Promise<void> {
    this.socialError.set(null);
    try {
      await this.authService.socialLogin('google', idToken);
      this.router.navigate(['/dashboard']);
    } catch {
      this.socialError.set(this.authService.error() ?? 'Erro ao entrar com Google. Tente novamente.');
    }
  }

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
