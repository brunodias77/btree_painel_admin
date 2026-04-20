import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BrandItem, CategoryItem, CreateProductRequest } from '../../../../core/models/catalog.model';
import { Button } from '../../../../shared/components/button/button';
import { ImageUploader } from '../../../../shared/components/image-uploader/image-uploader';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKU_PATTERN  = /^[A-Z0-9_-]+$/;

interface SelectCategory { id: string; label: string; depth: number; }

function flattenForSelect(items: CategoryItem[], depth = 0): SelectCategory[] {
  return items.flatMap(item => [
    { id: item.id, label: item.name, depth },
    ...flattenForSelect(item.children ?? [], depth + 1),
  ]);
}

interface ImageEntry { id: number; url: string | null; alt_text: string; }

@Component({
  selector: 'app-create-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, ImageUploader],
  templateUrl: './create-product-form.html',
})
export class CreateProductForm {
  private readonly fb = inject(FormBuilder);
  private _imgId = 0;

  brands     = input<BrandItem[]>([]);
  categories = input<CategoryItem[]>([]);
  submitting = input(false);

  submitted = output<CreateProductRequest>();
  cancelled = output<void>();

  protected readonly wasSubmitted   = signal(false);
  protected readonly images         = signal<ImageEntry[]>([]);
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
    low_stock_threshold: [5,  [Validators.min(0)]],
    weight:              [null as number | null, [Validators.min(0)]],
    width:               [null as number | null, [Validators.min(0)]],
    height:              [null as number | null, [Validators.min(0)]],
    depth:               [null as number | null, [Validators.min(0)]],
  });

  private readonly _formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
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

  // ── Imagens ─────────────────────────────────────────────────────────────────

  protected addImage(): void {
    this.images.update(list => [...list, { id: this._imgId++, url: null, alt_text: '' }]);
  }

  protected removeImage(index: number): void {
    this.images.update(list => list.filter((_, i) => i !== index));
  }

  protected moveImageUp(index: number): void {
    if (index === 0) return;
    this.images.update(list => {
      const copy = [...list];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  }

  protected moveImageDown(index: number): void {
    this.images.update(list => {
      if (index >= list.length - 1) return list;
      const copy = [...list];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  }

  protected setImageUrl(index: number, url: string | null): void {
    this.images.update(list =>
      list.map((img, i) => i === index ? { ...img, url } : img),
    );
  }

  protected setImageAltText(index: number, event: Event): void {
    const alt_text = (event.target as HTMLInputElement).value;
    this.images.update(list =>
      list.map((img, i) => i === index ? { ...img, alt_text } : img),
    );
  }

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
      images: this.images()
        .filter(img => img.url)
        .map((img, i) => ({
          url:        img.url!,
          alt_text:   img.alt_text || null,
          sort_order: i,
        })),
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
