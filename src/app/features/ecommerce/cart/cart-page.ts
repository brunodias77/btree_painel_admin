import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EcommerceService } from '../../../core/services/ecommerce.service';

@Component({
  selector: 'app-cart-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './cart-page.html',
})
export class CartPage {
  protected readonly store = inject(EcommerceService);

  protected readonly shipping = computed(() =>
    this.store.cartTotal() >= 299 ? 0 : 19.9,
  );

  protected readonly total = computed(() =>
    this.store.cartTotal() + this.shipping(),
  );
}
