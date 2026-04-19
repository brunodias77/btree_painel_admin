import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { AddAddressRequest, AddressItem } from '../../../../../core/models/auth.model';
import { AddAddressForm } from '../add-address-form/add-address-form';

@Component({
  selector: 'app-address-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AddAddressForm],
  templateUrl: './address-section.html',
})
export class AddressSection {
  private readonly authService = inject(AuthService);

  protected readonly addressesResource = resource({
    loader: () => this.authService.listAddresses(),
  });

  protected readonly showForm      = signal(false);
  protected readonly submitting    = signal(false);
  protected readonly serverError   = signal<string | null>(null);
  protected readonly editingAddress = signal<AddressItem | null>(null);

  private readonly formRef = viewChild(AddAddressForm);

  protected openNewForm(): void {
    this.editingAddress.set(null);
    this.formRef()?.reset();
    this.serverError.set(null);
    this.showForm.set(true);
  }

  protected openEditForm(address: AddressItem): void {
    this.editingAddress.set(address);
    this.serverError.set(null);
    this.showForm.set(true);
    // initialize após a view renderizar o form
    setTimeout(() => this.formRef()?.initialize(address));
  }

  protected onCancelled(): void {
    this.showForm.set(false);
    this.editingAddress.set(null);
    this.serverError.set(null);
  }

  protected async onSubmitted(payload: AddAddressRequest): Promise<void> {
    this.submitting.set(true);
    this.serverError.set(null);
    const editing = this.editingAddress();
    try {
      if (editing) {
        await this.authService.updateAddress(editing.id, payload);
      } else {
        await this.authService.addAddress(payload);
      }
      this.showForm.set(false);
      this.editingAddress.set(null);
      this.addressesResource.reload();
    } catch {
      this.serverError.set(this.authService.error() ?? 'Erro ao salvar endereço. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }
}
