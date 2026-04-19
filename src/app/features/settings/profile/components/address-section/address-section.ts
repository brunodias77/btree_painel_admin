import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { AddAddressRequest, AddAddressResponse } from '../../../../../core/models/auth.model';
import { AddAddressForm } from '../add-address-form/add-address-form';

@Component({
  selector: 'app-address-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AddAddressForm],
  templateUrl: './address-section.html',
})
export class AddressSection {
  private readonly authService = inject(AuthService);

  protected readonly showForm    = signal(false);
  protected readonly submitting  = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly addresses   = signal<AddAddressResponse[]>([]);

  private readonly formRef = viewChild(AddAddressForm);

  protected openForm(): void {
    this.formRef()?.reset();
    this.serverError.set(null);
    this.showForm.set(true);
  }

  protected onCancelled(): void {
    this.showForm.set(false);
    this.serverError.set(null);
  }

  protected async onSubmitted(payload: AddAddressRequest): Promise<void> {
    this.submitting.set(true);
    this.serverError.set(null);
    try {
      const res = await this.authService.addAddress(payload);
      this.addresses.update(list => [...list, res]);
      this.showForm.set(false);
    } catch {
      this.serverError.set(this.authService.error() ?? 'Erro ao salvar endereço. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }
}
