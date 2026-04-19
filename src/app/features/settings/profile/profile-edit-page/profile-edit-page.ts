import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { UpdateProfileRequest } from '../../../../core/models/auth.model';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-profile-edit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, RouterLink],
  templateUrl: './profile-edit-page.html',
})
export class ProfileEditPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly serverError = this.authService.error;
  protected readonly serverErrors = this.authService.serverErrors;
  protected readonly submitting = this.authService.loading;

  protected readonly _submitted = signal(false);

  protected readonly form = this.fb.group({
    firstName:           ['', [Validators.maxLength(100)]],
    lastName:            ['', [Validators.maxLength(100)]],
    cpf:                 ['', [Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    birthDate:           [''],
    gender:              ['', [Validators.maxLength(20)]],
    preferredLanguage:   ['pt-BR', [Validators.minLength(2), Validators.maxLength(10)]],
    preferredCurrency:   ['BRL', [Validators.minLength(3), Validators.maxLength(3)]],
    newsletterSubscribed:[false],
  });

  private readonly _formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  private readonly profileResource = resource({
    loader: () => this.authService.getProfile(),
  });

  protected readonly loading = this.profileResource.isLoading;

  protected readonly firstNameError    = computed(() => this.fieldError('firstName'));
  protected readonly lastNameError     = computed(() => this.fieldError('lastName'));
  protected readonly languageError     = computed(() => this.fieldError('preferredLanguage'));
  protected readonly currencyError     = computed(() => this.fieldError('preferredCurrency'));
  protected readonly cpfError          = computed(() => {
    this._formValue();
    if (!this._submitted()) return null;
    const ctrl = this.form.get('cpf')!;
    return ctrl.invalid ? 'Use o formato 000.000.000-00.' : null;
  });

  constructor() {
    effect(() => {
      const profile = this.profileResource.value();
      if (!profile) return;
      this.form.patchValue({
        firstName:           profile.first_name           ?? '',
        lastName:            profile.last_name            ?? '',
        cpf:                 profile.cpf                  ?? '',
        birthDate:           profile.birth_date           ?? '',
        gender:              profile.gender               ?? '',
        preferredLanguage:   profile.preferred_language   ?? 'pt-BR',
        preferredCurrency:   profile.preferred_currency   ?? 'BRL',
        newsletterSubscribed:profile.newsletter_subscribed,
      });
    });
  }

  protected async submit(): Promise<void> {
    this._submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: UpdateProfileRequest = {
      first_name:           emptyToNull(v.firstName),
      last_name:            emptyToNull(v.lastName),
      cpf:                  emptyToNull(v.cpf),
      birth_date:           emptyToNull(v.birthDate),
      gender:               emptyToNull(v.gender),
      preferred_language:   emptyToNull(v.preferredLanguage)            ?? 'pt-BR',
      preferred_currency:   emptyToNull(v.preferredCurrency)?.toUpperCase() ?? 'BRL',
      newsletter_subscribed:v.newsletterSubscribed ?? false,
    };

    try {
      await this.authService.updateProfile(payload);
      this.router.navigate(['/settings/profile']);
    } catch {
      // erro gerenciado pelo authService.error signal
    }
  }

  private fieldError(name: 'firstName' | 'lastName' | 'preferredLanguage' | 'preferredCurrency'): string | null {
    this._formValue();
    if (!this._submitted()) return null;
    const ctrl = this.form.get(name)!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('maxlength')) return 'Texto acima do tamanho permitido.';
    if (ctrl.hasError('minlength')) return 'Texto abaixo do tamanho mínimo.';
    return 'Valor inválido.';
  }
}

function emptyToNull(value: string | null | undefined): string | null {
  const s = value?.trim() ?? '';
  return s || null;
}
