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

  protected readonly showForm         = signal(false);
  protected readonly submitting       = signal(false);
  protected readonly deleting         = signal(false);
  protected readonly settingDefaultId = signal<string | null>(null);
  protected readonly serverError      = signal<string | null>(null);
  protected readonly editingAddress   = signal<AddressItem | null>(null);
  protected readonly confirmDeleteId  = signal<string | null>(null);

  private readonly formRef = viewChild(AddAddressForm);

  protected openNewForm(): void {
    this.editingAddress.set(null);
    this.confirmDeleteId.set(null);
    this.formRef()?.reset();
    this.serverError.set(null);
    this.showForm.set(true);
  }

  protected openEditForm(address: AddressItem): void {
    this.confirmDeleteId.set(null);
    this.editingAddress.set(address);
    this.serverError.set(null);
    this.showForm.set(true);
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

  protected async setAsDefault(addressId: string): Promise<void> {
    this.settingDefaultId.set(addressId);
    this.serverError.set(null);
    try {
      await this.authService.setDefaultAddress(addressId);
      this.addressesResource.reload();
    } catch {
      this.serverError.set(
        this.authService.error() ?? 'Erro ao definir endereço padrão. Tente novamente.',
      );
    } finally {
      this.settingDefaultId.set(null);
    }
  }

  protected requestDelete(addressId: string): void {
    this.serverError.set(null);
    this.confirmDeleteId.set(addressId);
  }

  protected cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  protected async confirmDelete(addressId: string): Promise<void> {
    this.deleting.set(true);
    this.serverError.set(null);
    try {
      await this.authService.deleteAddress(addressId);
      this.confirmDeleteId.set(null);
      this.addressesResource.reload();
    } catch {
      this.confirmDeleteId.set(null);
      this.serverError.set(
        this.authService.error() ?? 'Erro ao remover endereço. Tente novamente.',
      );
    } finally {
      this.deleting.set(false);
    }
  }
}
