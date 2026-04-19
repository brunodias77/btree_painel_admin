import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AddAddressRequest, AddressItem } from '../../../../../core/models/auth.model';
import { Button } from '../../../../../shared/components/button/button';

@Component({
  selector: 'app-add-address-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button],
  templateUrl: './add-address-form.html',
})
export class AddAddressForm {
  private readonly fb = inject(FormBuilder);

  submitted  = output<AddAddressRequest>();
  cancelled  = output<void>();

  protected readonly submitting = signal(false);
  protected readonly wasSubmitted = signal(false);

  protected readonly form = this.fb.group({
    label:              ['', [Validators.maxLength(50)]],
    recipient_name:     ['', [Validators.maxLength(150)]],
    street:             ['', [Validators.required, Validators.maxLength(255)]],
    number:             ['', [Validators.maxLength(20)]],
    complement:         ['', [Validators.maxLength(100)]],
    neighborhood:       ['', [Validators.maxLength(100)]],
    city:               ['', [Validators.required, Validators.maxLength(100)]],
    state:              ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
    postal_code:        ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    country:            ['BR', [Validators.minLength(2), Validators.maxLength(2)]],
    is_billing_address: [false],
  });

  private readonly _formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  protected readonly streetError = computed(() => this.fieldError('street', 'Logradouro é obrigatório.'));
  protected readonly cityError   = computed(() => this.fieldError('city', 'Cidade é obrigatória.'));
  protected readonly stateError  = computed(() => {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get('state')!;
    if (!ctrl.invalid) return null;
    return 'Use a sigla do estado com 2 letras maiúsculas (ex: SP).';
  });
  protected readonly postalCodeError = computed(() => {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get('postal_code')!;
    if (!ctrl.invalid) return null;
    return 'Use o formato 00000-000.';
  });

  protected submit(): void {
    this.wasSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitted.emit({
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
    });
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  reset(): void {
    this.form.reset({ country: 'BR', is_billing_address: false });
    this.wasSubmitted.set(false);
  }

  initialize(address: AddressItem): void {
    this.form.patchValue({
      label:              address.label ?? '',
      recipient_name:     address.recipientName ?? '',
      street:             address.street,
      number:             address.number ?? '',
      complement:         address.complement ?? '',
      neighborhood:       address.neighborhood ?? '',
      city:               address.city,
      state:              address.state,
      postal_code:        address.postalCode,
      country:            address.country ?? 'BR',
      is_billing_address: address.isBillingAddress,
    });
    this.wasSubmitted.set(false);
  }

  private fieldError(name: keyof typeof this.form.controls, requiredMsg: string): string | null {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get(name as string)!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('required')) return requiredMsg;
    if (ctrl.hasError('maxlength')) return 'Texto acima do tamanho permitido.';
    return 'Valor inválido.';
  }
}

function emptyToNull(value: string | null | undefined): string | null {
  return value?.trim() || null;
}
