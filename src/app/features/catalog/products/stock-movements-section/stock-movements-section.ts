import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { StockMovementItem, StockMovementType } from '../../../../core/models/catalog.model';

@Component({
  selector: 'app-stock-movements-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-movements-section.html',
})
export class StockMovementsSection {
  private readonly productService = inject(ProductService);

  readonly productId      = input.required<string>();
  readonly refreshTrigger = input<number>(0);

  protected readonly movements   = signal<StockMovementItem[]>([]);
  protected readonly loading     = signal(false);
  protected readonly error       = signal<string | null>(null);
  protected readonly currentPage = signal(0);
  protected readonly totalPages  = signal(0);
  protected readonly totalItems  = signal(0);

  constructor() {
    effect(() => {
      this.refreshTrigger();
      this.load(0);
    });
  }

  protected async goTo(page: number): Promise<void> {
    if (page < 0 || page >= this.totalPages()) return;
    await this.load(page);
  }

  private async load(page: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.productService.listStockMovements(this.productId(), page, 20);
      this.movements.set(res.items);
      this.currentPage.set(res.page);
      this.totalPages.set(res.total_pages);
      this.totalItems.set(res.total_elements);
    } catch {
      this.error.set('Não foi possível carregar as movimentações.');
    } finally {
      this.loading.set(false);
    }
  }

  protected typeLabel(type: StockMovementType): string {
    const labels: Record<StockMovementType, string> = {
      IN:         'Entrada',
      OUT:        'Saída',
      RESERVE:    'Reserva',
      RELEASE:    'Liberação',
      ADJUSTMENT: 'Ajuste',
      RETURN:     'Devolução',
    };
    return labels[type] ?? type;
  }

  protected typeClasses(type: StockMovementType): string {
    const map: Record<StockMovementType, string> = {
      IN:         'bg-green-100 text-green-700',
      RETURN:     'bg-green-100 text-green-700',
      RELEASE:    'bg-blue-100 text-blue-700',
      OUT:        'bg-red-100 text-red-700',
      RESERVE:    'bg-orange-100 text-orange-700',
      ADJUSTMENT: 'bg-zinc-100 text-zinc-600',
    };
    return map[type] ?? 'bg-zinc-100 text-zinc-600';
  }

  protected formatDate(iso: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  }
}
