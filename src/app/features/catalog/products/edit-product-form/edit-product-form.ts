import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BrandItem,
  CategoryItem,
  ProductDetail,
  UpdateProductRequest,
} from '../../../../core/models/catalog.model';
import { Button } from '../../../../shared/components/button/button';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKU_PATTERN  = /^[A-Z0-9_-]+$/;

interface SelectCategory { id: string; label: string; depth: number; }

function flattenForSelect(items: CategoryItem[], depth = 0): SelectCategory[] {
  return items.flatMap(item => [
    { id: item.id, label: item.name, depth },
    ...flattenForSelect(item.children ?? [], depth + 1),
  ]);
}

@Component({
  selector: 'app-edit-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button],
  templateUrl: './edit-product-form.html',
})
export class EditProductForm {
  private readonly fb = inject(FormBuilder);

  brands      = input<BrandItem[]>([]);
  categories  = input<CategoryItem[]>([]);
  initialData = input<ProductDetail | null>(null);
  submitting  = input(false);

  submitted = output<UpdateProductRequest>();
  cancelled = output<void>();

  protected readonly wasSubmitted   = signal(false);
  protected readonly flatCategories = computed(() => flattenForSelect(this.categories()));

  protected readonly form = this.fb.group({
    name:                ['', [Validators.required, Validators.maxLength(300)]],
    slug:                ['', [Validators.required, Validators.maxLength(350), Validators.pattern(SLUG_PATTERN)]],
    sku:                 ['', [Validators.required, Validators.maxLength(50),  Validators.pattern(SKU_PATTERN)]],
    category_id:         [null as string | null],
    brand_id:            [null as string | null],
    short_description:   ['', [Validators.maxLength(500)]],
    description:         [''],
    price:               [null as number | null, [Validators.required, Validators.min(0)]],
    compare_at_price:    [null as number | null, [Validators.min(0)]],
    cost_price:          [null as number | null, [Validators.min(0)]],
    low_stock_threshold: [0,  [Validators.required, Validators.min(0)]],
    weight:              [null as number | null, [Validators.min(0)]],
    width:               [null as number | null, [Validators.min(0)]],
    height:              [null as number | null, [Validators.min(0)]],
    depth:               [null as number | null, [Validators.min(0)]],
    featured:            [false],
  });

  private readonly _formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  // Pre-populate the form whenever initialData arrives
  private readonly _patchEffect = effect(() => {
    const p = this.initialData();
    if (!p) return;
    this.form.patchValue({
      name:                p.name,
      slug:                p.slug,
      sku:                 p.sku,
      category_id:         p.category_id,
      brand_id:            p.brand_id,
      short_description:   p.short_description ?? '',
      description:         p.description ?? '',
      price:               p.price,
      compare_at_price:    p.compare_at_price,
      cost_price:          p.cost_price,
      low_stock_threshold: p.low_stock_threshold,
      weight:              p.weight,
      width:               p.width,
      height:              p.height,
      depth:               p.depth,
      featured:            p.featured,
    }, { emitEvent: false });
  });

  // ── Erros ───────────────────────────────────────────────────────────────────

  protected readonly nameError = computed(() =>
    this.fieldError('name', 'Nome é obrigatório.'),
  );

  protected readonly slugError = computed(() => {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get('slug')!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'Slug é obrigatório.';
    if (ctrl.hasError('maxlength')) return 'Slug deve ter no máximo 350 caracteres.';
    if (ctrl.hasError('pattern')) return 'Use apenas letras minúsculas, números e hífens (ex: meu-produto).';
    return 'Valor inválido.';
  });

  protected readonly skuError = computed(() => {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get('sku')!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'SKU é obrigatório.';
    if (ctrl.hasError('maxlength')) return 'SKU deve ter no máximo 50 caracteres.';
    if (ctrl.hasError('pattern')) return 'Use apenas letras maiúsculas, números, hífens e underscores (ex: CAM-001_P).';
    return 'Valor inválido.';
  });

  protected readonly priceError = computed(() => {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get('price')!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'Preço é obrigatório.';
    if (ctrl.hasError('min')) return 'Preço não pode ser negativo.';
    return 'Valor inválido.';
  });

  protected readonly shortDescError = computed(() =>
    this.fieldError('short_description', ''),
  );

  // ── Slug / SKU ──────────────────────────────────────────────────────────────

  protected generateSlug(): void {
    const name = this.form.get('name')?.value ?? '';
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    this.form.get('slug')?.setValue(slug);
  }

  protected normalizeSku(): void {
    const ctrl = this.form.get('sku')!;
    const normalized = (ctrl.value ?? '').toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (normalized !== ctrl.value) ctrl.setValue(normalized, { emitEvent: false });
  }

  // ── Submit / Cancel ─────────────────────────────────────────────────────────

  protected submit(): void {
    this.wasSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitted.emit({
      category_id:         v.category_id || null,
      brand_id:            v.brand_id || null,
      name:                v.name!,
      slug:                v.slug!,
      description:         emptyToNull(v.description),
      short_description:   emptyToNull(v.short_description),
      sku:                 v.sku!,
      price:               v.price!,
      compare_at_price:    v.compare_at_price ?? null,
      cost_price:          v.cost_price ?? null,
      low_stock_threshold: v.low_stock_threshold ?? 0,
      weight:              v.weight ?? null,
      width:               v.width ?? null,
      height:              v.height ?? null,
      depth:               v.depth ?? null,
      featured:            v.featured ?? false,
    });
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private fieldError(name: keyof typeof this.form.controls, requiredMsg: string): string | null {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get(name as string)!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('required')) return requiredMsg;
    if (ctrl.hasError('maxlength')) return 'Texto acima do tamanho permitido.';
    if (ctrl.hasError('min')) return 'Valor não pode ser negativo.';
    return 'Valor inválido.';
  }
}

function emptyToNull(value: string | null | undefined): string | null {
  return value?.trim() || null;
}
