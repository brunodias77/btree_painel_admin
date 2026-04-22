import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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
export class ProductsPage implements OnInit {
  protected readonly store = inject(EcommerceService);

  protected readonly search = signal('');

  protected readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.store.products();
    return this.store.products().filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  });

  protected readonly skeletons = Array(8);

  ngOnInit(): void {
    this.store.loadInitial();
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected selectCategory(categoryId: string | null): void {
    this.search.set('');
    this.store.filterByCategory(categoryId);
  }
}
