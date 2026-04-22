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
import { CategoryItem, UpdateCategoryRequest } from '../../../../core/models/catalog.model';
import { Button } from '../../../../shared/components/button/button';
import { ImageUploader } from '../../../../shared/components/image-uploader/image-uploader';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface SelectCategory {
  id: string;
  label: string;
  depth: number;
}

function flattenForSelect(items: CategoryItem[], excludeId: string, depth = 0): SelectCategory[] {
  return items.flatMap(item => {
    if (item.id === excludeId) return [];
    return [
      { id: item.id, label: item.name, depth },
      ...flattenForSelect(item.children, excludeId, depth + 1),
    ];
  });
}

@Component({
  selector: 'app-edit-category-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, ImageUploader],
  templateUrl: './edit-category-form.html',
})
export class EditCategoryForm {
  private readonly fb = inject(FormBuilder);

  initialData = input.required<CategoryItem>();
  categories  = input<CategoryItem[]>([]);
  submitting  = input(false);

  submitted = output<UpdateCategoryRequest>();
  cancelled = output<void>();

  protected readonly wasSubmitted = signal(false);

  protected readonly flatCategories = computed(() =>
    flattenForSelect(this.categories(), this.initialData().id),
  );

  protected readonly form = this.fb.group({
    parent_id:   [null as string | null],
    name:        ['', [Validators.required, Validators.maxLength(200)]],
    slug:        ['', [Validators.required, Validators.maxLength(256), Validators.pattern(SLUG_PATTERN)]],
    description: ['' as string | null],
    image_url:   [null as string | null, [Validators.maxLength(512)]],
    sort_order:  [0, [Validators.min(0)]],
  });

  private readonly _formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  constructor() {
    effect(() => {
      const d = this.initialData();
      this.form.patchValue({
        parent_id:   d.parent_id ?? null,
        name:        d.name,
        slug:        d.slug,
        description: d.description ?? '',
        image_url:   d.image_url ?? null,
        sort_order:  d.sort_order,
      });
    });
  }

  protected readonly nameError = computed(() =>
    this.fieldError('name', 'Nome é obrigatório.'),
  );

  protected readonly slugError = computed(() => {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get('slug')!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('required')) return 'Slug é obrigatório.';
    if (ctrl.hasError('maxlength')) return 'Slug deve ter no máximo 256 caracteres.';
    if (ctrl.hasError('pattern')) return 'Use apenas letras minúsculas, números e hífens (ex: minha-categoria).';
    return 'Valor inválido.';
  });

  protected readonly sortOrderError = computed(() => {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get('sort_order')!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('min')) return 'Ordem deve ser maior ou igual a 0.';
    return 'Valor inválido.';
  });

  protected readonly currentImageUrl = computed(() =>
    this.form.get('image_url')!.value ?? null,
  );

  protected onImageUploaded(url: string | null): void {
    this.form.get('image_url')?.setValue(url);
  }

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

  protected submit(): void {
    this.wasSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitted.emit({
      parent_id:   v.parent_id || null,
      name:        v.name!,
      slug:        v.slug!,
      description: emptyToNull(v.description),
      image_url:   v.image_url || null,
      sort_order:  v.sort_order ?? 0,
    });
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  private fieldError(name: keyof typeof this.form.controls, requiredMsg: string): string | null {
    this._formValue();
    if (!this.wasSubmitted()) return null;
    const ctrl = this.form.get(name as string)!;
    if (!ctrl.invalid) return null;
    if (ctrl.hasError('required')) return requiredMsg;
    if (ctrl.hasError('maxlength')) return 'Texto acima do tamanho permitido.';
    return 'Valor inválido.';
  }
}

function emptyToNull(value: string | null | undefined): string | null {
  return value?.trim() || null;
}
