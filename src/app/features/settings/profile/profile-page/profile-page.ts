import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { AddAddressRequest } from '../../../../core/models/auth.model';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ReactiveFormsModule, Button],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly user = this.authService.user;
  protected readonly submitting = this.authService.loading;
  protected readonly serverError = this.authService.error;
  protected readonly serverErrors = this.authService.serverErrors;

  protected readonly profileResource = resource({
    loader: () => this.authService.getProfile(),
  });

  // ── Add Address form state ────────────────────────────────────────────

  protected readonly showAddressForm = signal(false);
  protected readonly addressSubmitted = signal(false);
  protected readonly addressSuccess = signal(false);

  protected readonly addressForm = this.fb.group({
    label:            ['', [Validators.maxLength(50)]],
    recipient_name:   ['', [Validators.maxLength(150)]],
    street:           ['', [Validators.required, Validators.maxLength(255)]],
    number:           ['', [Validators.maxLength(20)]],
    complement:       ['', [Validators.maxLength(100)]],
    neighborhood:     ['', [Validators.maxLength(100)]],
    city:             ['', [Validators.required, Validators.maxLength(100)]],
    state:            ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
    postal_code:      ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    country:          ['BR', [Validators.minLength(2), Validators.maxLength(2)]],
    is_billing_address: [false],
  });

  private readonly _addressFormValue = toSignal(this.addressForm.valueChanges, {
    initialValue: this.addressForm.value,
  });

  protected readonly streetError = computed(() => this.addressFieldError('street', 'Logradouro é obrigatório.'));
  protected readonly cityError   = computed(() => this.addressFieldError('city', 'Cidade é obrigatória.'));
  protected readonly stateError  = computed(() => {
    this._addressFormValue();
    if (!this.addressSubmitted()) return null;
    const ctrl = this.addressForm.get('state')!;
    if (!ctrl.invalid) return null;
    return 'Use a sigla do estado com 2 letras maiúsculas (ex: SP).';
  });
  protected readonly postalCodeError = computed(() => {
    this._addressFormValue();
    if (!this.addressSubmitted()) return null;
    const ctrl = this.addressForm.get('postal_code')!;
    if (!ctrl.invalid) return null;
    return 'Use o formato 00000-000.';
  });

  // ── Helpers ───────────────────────────────────────────────────────────

  protected genderLabel(gender: string | null): string {
    const map: Record<string, string> = { F: 'Feminino', M: 'Masculino', OTHER: 'Outro' };
    return gender ? (map[gender] ?? gender) : '—';
  }

  protected initials(): string {
    const p = this.profileResource.value();
    const first = p?.first_name?.charAt(0) ?? '';
    const last  = p?.last_name?.charAt(0)  ?? '';
    return (first + last).toUpperCase() || this.user()?.username?.charAt(0)?.toUpperCase() || '?';
  }

  protected openAddressForm(): void {
    this.addressForm.reset({
      label: '', recipient_name: '', street: '', number: '',
      complement: '', neighborhood: '', city: '', state: '',
      postal_code: '', country: 'BR', is_billing_address: false,
    });
    this.addressSubmitted.set(false);
    this.addressSuccess.set(false);
    this.showAddressForm.set(true);
  }

  protected cancelAddressForm(): void {
    this.showAddressForm.set(false);
    this.addressSubmitted.set(false);
  }

  protected async submitAddress(): Promise<void> {
    this.addressSubmitted.set(true);
    this.addressSuccess.set(false);

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const v = this.addressForm.getRawValue();
    const payload: AddAddressRequest = {
      label:              emptyToNull(v.label),
      recipient_name:     emptyToNull(v.recipient_name),
      street:             v.street!,
      number:             emptyToNull(v.number),
      complement:         emptyToNull(v.complement),
      neighborhood:       emptyToNull(v.neighborhood),
      city:               v.city!,
      state:              v.state!.toUpperCase(),
      postal_code:        v.postal_code!,
      country:            emptyToNull(v.country) ?? 'BR',
      is_billing_address: v.is_billing_address ?? false,
    };

    try {
      await this.authService.addAddress(payload);
      this.addressSuccess.set(true);
      this.showAddressForm.set(false);
    } catch {
      // erro gerenciado pelo authService.error signal
    }
  }

  private addressFieldError(name: keyof typeof this.addressForm.controls, requiredMsg: string): string | null {
    this._addressFormValue();
    if (!this.addressSubmitted()) return null;
    const ctrl = this.addressForm.get(name as string)!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('required')) return requiredMsg;
    if (ctrl.hasError('maxlength')) return 'Texto acima do tamanho permitido.';
    return 'Valor inválido.';
  }
}

function emptyToNull(value: string | null | undefined): string | null {
  const s = value?.trim() ?? '';
  return s || null;
}
