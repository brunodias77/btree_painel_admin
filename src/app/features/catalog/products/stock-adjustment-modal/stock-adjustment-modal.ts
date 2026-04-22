import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdjustStockResponse, ProductDetail, StockMovementType } from '../../../../core/models/catalog.model';
import { ProductService } from '../../../../core/services/product.service';
import { Button } from '../../../../shared/components/button/button';

type MovementOption = { value: StockMovementType; label: string; sign: 1 | -1 | 0 };

const MOVEMENT_OPTIONS: MovementOption[] = [
  { value: 'IN',         label: 'Entrada (IN)',          sign:  1 },
  { value: 'OUT',        label: 'Saída (OUT)',            sign: -1 },
  { value: 'RESERVE',    label: 'Reserva (RESERVE)',      sign: -1 },
  { value: 'RELEASE',    label: 'Liberação (RELEASE)',    sign:  1 },
  { value: 'ADJUSTMENT', label: 'Ajuste (ADJUSTMENT)',    sign:  0 },
  { value: 'RETURN',     label: 'Devolução (RETURN)',     sign:  1 },
];

@Component({
  selector: 'app-stock-adjustment-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button],
  templateUrl: './stock-adjustment-modal.html',
})
export class StockAdjustmentModal implements OnDestroy {
  private readonly fb             = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  readonly product = input.required<ProductDetail>();

  readonly closed   = output<void>();
  readonly adjusted = output<AdjustStockResponse>();

  protected readonly movementOptions = MOVEMENT_OPTIONS;
  protected readonly submitting      = signal(false);
  protected readonly serverErrors    = signal<string[]>([]);
  protected readonly wasSubmitted    = signal(false);
  protected readonly success         = signal<AdjustStockResponse | null>(null);
  protected readonly showAdvanced    = signal(false);

  protected readonly form = this.fb.group({
    movementType:       ['IN' as StockMovementType, [Validators.required]],
    quantity:           [null as number | null, [Validators.required, Validators.min(1)]],
    adjustmentSign:     ['+' as '+' | '-'],
    notes:              ['' as string | null, [Validators.maxLength(1000)]],
    referenceId:        ['' as string | null],
    referenceType:      ['' as string | null, [Validators.maxLength(50)]],
  });

  protected readonly selectedOption = computed(() => {
    const val = this.form.get('movementType')!.value as StockMovementType;
    return MOVEMENT_OPTIONS.find(o => o.value === val) ?? MOVEMENT_OPTIONS[0];
  });

  protected readonly isAdjustment = computed(() => this.selectedOption().sign === 0);

  protected readonly quantityError = computed(() => {
    if (!this.wasSubmitted()) return null;
    const c = this.form.get('quantity')!;
    if (c.hasError('required')) return 'Quantidade é obrigatória.';
    if (c.hasError('min')) return 'Informe pelo menos 1.';
    return null;
  });

  protected readonly notesError = computed(() => {
    if (!this.wasSubmitted()) return null;
    const c = this.form.get('notes')!;
    if (c.hasError('maxlength')) return 'Máximo de 1000 caracteres.';
    return null;
  });

  protected readonly referenceTypeError = computed(() => {
    if (!this.wasSubmitted()) return null;
    const c = this.form.get('referenceType')!;
    if (c.hasError('maxlength')) return 'Máximo de 50 caracteres.';
    return null;
  });

  async onSubmit(): Promise<void> {
    this.wasSubmitted.set(true);
    if (this.form.invalid) return;

    const { movementType, quantity, adjustmentSign, notes, referenceId, referenceType } = this.form.getRawValue();

    const option = MOVEMENT_OPTIONS.find(o => o.value === movementType)!;
    const sign   = option.sign === 0 ? (adjustmentSign === '+' ? 1 : -1) : option.sign;
    const delta  = sign * (quantity ?? 0);

    this.submitting.set(true);
    this.serverErrors.set([]);
    try {
      const response = await this.productService.adjustStock(this.product().id, {
        delta,
        movementType: movementType as StockMovementType,
        notes:         notes         || null,
        referenceId:   referenceId   || null,
        referenceType: referenceType || null,
      });
      this.success.set(response);
      this.adjusted.emit(response);
    } catch {
      this.serverErrors.set(this.productService.serverErrors());
    } finally {
      this.submitting.set(false);
    }
  }

  protected close(): void {
    this.closed.emit();
  }

  ngOnDestroy(): void {
    this.form.reset();
  }
}
