import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { EcommerceService } from '../../../core/services/ecommerce.service';
import { CartItemResponse, CartResponse } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './cart-page.html',
})
export class CartPage implements OnInit {
  protected readonly store = inject(EcommerceService);
  private readonly auth = inject(AuthService);
  private readonly cartService = inject(CartService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly cart = signal<CartResponse | null>(null);

  protected readonly items = computed(() => this.cart()?.items ?? []);

  protected readonly shipping = computed(() => {
    const subtotal = this.cart()?.subtotal ?? 0;
    return subtotal >= 299 ? 0 : 19.9;
  });

  protected readonly total = computed(
    () => (this.cart()?.subtotal ?? 0) + this.shipping(),
  );

  async ngOnInit(): Promise<void> {
    const userId = this.auth.user()?.userId;
    if (!userId) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.cartService.getCart(userId);
      this.cart.set(response);
    } catch {
      this.error.set('Não foi possível carregar o carrinho. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  protected formatPrice(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  protected removeItem(item: CartItemResponse): void {
    this.cart.update(c => {
      if (!c) return c;
      const items = c.items.filter(i => i.cartItemId !== item.cartItemId);
      const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
      return { ...c, items, subtotal, totalItems: items.reduce((s, i) => s + i.quantity, 0) };
    });
    this.store.removeFromCart(item.productId);
  }

  protected updateQty(item: CartItemResponse, delta: number): void {
    const qty = item.quantity + delta;
    if (qty <= 0) {
      this.removeItem(item);
      return;
    }
    this.cart.update(c => {
      if (!c) return c;
      const items = c.items.map(i =>
        i.cartItemId === item.cartItemId
          ? { ...i, quantity: qty, subtotal: i.unitPrice * qty }
          : i,
      );
      const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
      return { ...c, items, subtotal, totalItems: items.reduce((s, i) => s + i.quantity, 0) };
    });
  }

  protected reload(): void {
    this.ngOnInit();
  }
}
