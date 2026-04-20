import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductItem, ProductStatus } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-product-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './product-list-page.html',
})
export class ProductListPage implements OnInit {
  private readonly router         = inject(Router);
  private readonly productService = inject(ProductService);

  protected readonly loading      = this.productService.loading;
  protected readonly serverErrors = this.productService.serverErrors;

  protected readonly products     = signal<ProductItem[]>([]);
  protected readonly currentPage  = signal(0);
  protected readonly totalPages   = signal(0);
  protected readonly totalItems   = signal(0);

  protected readonly pageSize = 20;

  async ngOnInit(): Promise<void> {
    await this.load(0);
  }

  protected async goToPage(page: number): Promise<void> {
    if (page < 0 || page >= this.totalPages()) return;
    await this.load(page);
  }

  private async load(page: number): Promise<void> {
    try {
      const result = await this.productService.listAll(page, this.pageSize);
      this.products.set(result.items);
      this.currentPage.set(result.page);
      this.totalPages.set(result.total_pages);
      this.totalItems.set(result.total_elements);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  protected statusLabel(status: ProductStatus): string {
    const labels: Record<ProductStatus, string> = {
      DRAFT:          'Rascunho',
      ACTIVE:         'Ativo',
      INACTIVE:       'Inativo',
      PAUSED:         'Pausado',
      OUT_OF_STOCK:   'Sem estoque',
      DISCONTINUED:   'Descontinuado',
      ARCHIVED:       'Arquivado',
    };
    return labels[status] ?? status;
  }

  protected statusClasses(status: ProductStatus): string {
    const map: Record<ProductStatus, string> = {
      ACTIVE:       'bg-green-100 text-green-700',
      DRAFT:        'bg-zinc-100 text-zinc-600',
      INACTIVE:     'bg-yellow-100 text-yellow-700',
      PAUSED:       'bg-orange-100 text-orange-700',
      OUT_OF_STOCK: 'bg-red-100 text-red-700',
      DISCONTINUED: 'bg-red-100 text-red-700',
      ARCHIVED:     'bg-zinc-100 text-zinc-500',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  protected formatPrice(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
