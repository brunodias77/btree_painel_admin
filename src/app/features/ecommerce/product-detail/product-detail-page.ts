import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EcommerceService } from '../../../core/services/ecommerce.service';

@Component({
  selector: 'app-product-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './product-detail-page.html',
})
export class ProductDetailPage {
  readonly id = input.required<string>();

  protected readonly store = inject(EcommerceService);
  protected readonly router = inject(Router);

  protected readonly product = computed(() => this.store.getProductById(this.id()));
  protected readonly quantity = signal(1);
  protected readonly selectedImage = signal(0);
  protected readonly addedToCart = signal(false);
  protected readonly stars = [1, 2, 3, 4, 5];

  protected increment(): void {
    const p = this.product();
    if (!p) return;
    this.quantity.update(q => Math.min(q + 1, p.stock));
  }

  protected decrement(): void {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  protected addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.store.addToCart(p, this.quantity());
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2000);
  }

  protected Math = Math;
}
