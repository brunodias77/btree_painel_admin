import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { EcommerceService } from '../../../core/services/ecommerce.service';

@Component({
  selector: 'app-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './products-page.html',
})
export class ProductsPage {
  protected readonly store = inject(EcommerceService);

  protected readonly search = signal('');
  protected readonly selectedCategory = signal<string | null>(null);

  protected readonly categories = computed(() => {
    const cats = new Set(this.store.products.map(p => p.category));
    return ['Todos', ...Array.from(cats)];
  });

  protected readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const cat = this.selectedCategory();
    return this.store.products.filter(p => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCategory = !cat || p.category === cat;
      return matchesSearch && matchesCategory;
    });
  });

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly Math = Math;

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected selectCategory(cat: string): void {
    this.selectedCategory.set(cat === 'Todos' ? null : cat);
  }
}
