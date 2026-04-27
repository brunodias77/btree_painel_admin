import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, Product } from '../models/ecommerce.model';
import { CategoryItem, ProductItem } from '../models/catalog.model';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';

@Injectable({ providedIn: 'root' })
export class EcommerceService {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  private readonly _cart = signal<CartItem[]>([]);
  private readonly _favorites = signal<Set<string>>(new Set());
  private readonly _apiProducts = signal<Product[]>([]);
  private readonly _categories = signal<CategoryItem[]>([]);
  private readonly _loadingProducts = signal(false);
  private readonly _currentPage = signal(0);
  private readonly _totalPages = signal(1);
  private readonly _selectedCategoryId = signal<string | null>(null);
  private _initialized = false;

  readonly cart = this._cart.asReadonly();
  readonly favorites = this._favorites.asReadonly();
  readonly products = this._apiProducts.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly loadingProducts = this._loadingProducts.asReadonly();
  readonly selectedCategoryId = this._selectedCategoryId.asReadonly();

  readonly hasMore = computed(
    () => this._currentPage() < this._totalPages() - 1,
  );

  readonly cartCount = computed(() =>
    this._cart().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly cartTotal = computed(() =>
    this._cart().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  readonly favoriteProducts = computed(() => {
    const favIds = this._favorites();
    return this._apiProducts().filter(p => favIds.has(p.id));
  });

  async loadInitial(): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;

    try {
      const cats = await this.categoryService.listAll();
      this._categories.set(cats);
    } catch { /* ignore */ }

    await this._loadPage(0, null);
  }

  async filterByCategory(categoryId: string | null): Promise<void> {
    if (this._selectedCategoryId() === categoryId) return;
    this._selectedCategoryId.set(categoryId);
    this._apiProducts.set([]);
    await this._loadPage(0, categoryId);
  }

  async loadMore(): Promise<void> {
    const next = this._currentPage() + 1;
    if (next >= this._totalPages()) return;
    await this._loadPage(next, this._selectedCategoryId());
  }

  private async _loadPage(page: number, categoryId: string | null): Promise<void> {
    this._loadingProducts.set(true);
    try {
      const response = categoryId
        ? await this.productService.listByCategory(categoryId, page, 20)
        : await this.productService.listAll(page, 20);

      const mapped = response.items.map(item => this._mapProduct(item));
      if (page === 0) {
        this._apiProducts.set(mapped);
      } else {
        this._apiProducts.update(prev => [...prev, ...mapped]);
      }
      this._currentPage.set(page);
      this._totalPages.set(response.total_pages);
    } catch { /* ignore */ } finally {
      this._loadingProducts.set(false);
    }
  }

  private _mapProduct(item: ProductItem): Product {
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.short_description ?? '',
      price: Number(item.price),
      originalPrice: item.compare_at_price != null ? Number(item.compare_at_price) : undefined,
      imageUrl: item.primary_image_url ?? `https://picsum.photos/seed/${item.id}/600/600`,
      images: item.primary_image_url ? [item.primary_image_url] : [],
      category: '',
      brand: '',
      rating: 0,
      reviewCount: 0,
      stock: item.status === 'OUT_OF_STOCK' ? 0 : Number.MAX_SAFE_INTEGER,
      tags: [],
      status: item.status,
    };
  }

  isFavorite(id: string): boolean {
    return this._favorites().has(id);
  }

  toggleFavorite(id: string): void {
    this._favorites.update(favs => {
      const next = new Set(favs);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  addToCart(product: Product, quantity = 1): void {
    this._cart.update(cart => {
      const existing = cart.find(i => i.product.id === product.id);
      if (existing) {
        return cart.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...cart, { product, quantity }];
    });
  }

  removeFromCart(productId: string): void {
    this._cart.update(cart => cart.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._cart.update(cart =>
      cart.map(i => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  }

  clearCart(): void {
    this._cart.set([]);
  }

  getProductById(id: string): Product | undefined {
    return this._apiProducts().find(p => p.id === id);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  discount(price: number, original: number): number {
    return Math.round((1 - price / original) * 100);
  }
}
