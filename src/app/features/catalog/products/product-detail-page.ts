import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { AdjustStockResponse, ProductDetail, ProductImageOutput, ProductStatus } from '../../../core/models/catalog.model';
import { StockAdjustmentModal } from './stock-adjustment-modal/stock-adjustment-modal';
import { StockMovementsSection } from './stock-movements-section/stock-movements-section';

@Component({
  selector: 'app-product-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StockAdjustmentModal, StockMovementsSection],
  templateUrl: './product-detail-page.html',
})
export class ProductDetailPage implements OnInit {
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly productService = inject(ProductService);

  protected readonly loading      = this.productService.loading;
  protected readonly serverErrors = this.productService.serverErrors;

  protected readonly product          = signal<ProductDetail | null>(null);
  protected readonly activeImageIndex = signal(0);
  protected readonly showAdjustModal   = signal(false);
  protected readonly movementsKey      = signal(0);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/catalog/products']); return; }
    try {
      const p = await this.productService.getById(id);
      this.product.set(p);
    } catch {
      // erro exposto via serverErrors signal
    }
  }

  protected setActiveImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected activeImage(): ProductImageOutput | null {
    const p = this.product();
    if (!p || p.images.length === 0) return null;
    const idx = Math.min(this.activeImageIndex(), p.images.length - 1);
    return p.images[idx];
  }

  protected statusLabel(status: ProductStatus): string {
    const labels: Record<ProductStatus, string> = {
      DRAFT:        'Rascunho',
      ACTIVE:       'Ativo',
      INACTIVE:     'Inativo',
      PAUSED:       'Pausado',
      OUT_OF_STOCK: 'Sem estoque',
      DISCONTINUED: 'Descontinuado',
      ARCHIVED:     'Arquivado',
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

  protected formatPrice(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  protected formatDate(iso: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  }

  protected formatDimension(value: number | null, unit: string): string {
    return value != null ? `${value} ${unit}` : '—';
  }

  protected onStockAdjusted(response: AdjustStockResponse): void {
    this.product.update(p => p
      ? { ...p, quantity: response.quantityAfter, status: response.productStatus as ProductStatus }
      : p,
    );
    this.movementsKey.update(k => k + 1);
  }
}
