import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EcommerceService } from '../../../core/services/ecommerce.service';

@Component({
  selector: 'app-checkout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-page.html',
})
export class CheckoutPage {
  protected readonly store = inject(EcommerceService);
  private readonly fb = inject(FormBuilder);

  protected readonly orderPlaced = signal(false);
  protected readonly orderNumber = signal(0);

  protected readonly shipping = computed(() =>
    this.store.cartTotal() >= 299 ? 0 : 19.9,
  );

  protected readonly total = computed(() =>
    this.store.cartTotal() + this.shipping(),
  );

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    zipCode: ['', Validators.required],
    address: ['', Validators.required],
    number: ['', Validators.required],
    complement: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    paymentMethod: ['pix', Validators.required],
  });

  protected hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.orderNumber.set(Math.floor(Math.random() * 90000) + 10000);
    this.orderPlaced.set(true);
    this.store.clearCart();
  }
}
