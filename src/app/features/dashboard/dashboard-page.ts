import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BrandService } from '../../core/services/brand.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryItem } from '../../core/models/catalog.model';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly brandService = inject(BrandService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);

  protected readonly loadingStats = signal(true);
  protected readonly brandsCount = signal<number | null>(null);
  protected readonly categoriesCount = signal<number | null>(null);
  protected readonly productsTotal = signal<number | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  private async loadStats(): Promise<void> {
    const [brands, categories, products] = await Promise.allSettled([
      this.brandService.listAll(),
      this.categoryService.listAll(),
      this.productService.listAll(0, 1),
    ]);

    if (brands.status === 'fulfilled') this.brandsCount.set(brands.value.length);
    if (categories.status === 'fulfilled') this.categoriesCount.set(this.countCategories(categories.value));
    if (products.status === 'fulfilled') this.productsTotal.set(products.value.total_elements);

    this.loadingStats.set(false);
  }

  private countCategories(items: CategoryItem[]): number {
    return items.reduce((n, c) => n + 1 + this.countCategories(c.children), 0);
  }
}
