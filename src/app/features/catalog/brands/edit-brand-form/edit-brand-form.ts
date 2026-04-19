import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BrandItem, UpdateBrandRequest } from '../../../../core/models/catalog.model';
import { Button } from '../../../../shared/components/button/button';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

@Component({
  selector: 'app-edit-brand-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button],
  templateUrl: './edit-brand-form.html',
})
export class EditBrandForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  brand      = input.required<BrandItem>();
  submitting = input(false);

  submitted = output<UpdateBrandRequest>();
  cancelled = output<void>();

  protected readonly wasSubmitted = signal(false);

  protected readonly form = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(200)]],
    slug:        ['', [Validators.required, Validators.maxLength(256), Validators.pattern(SLUG_PATTERN)]],
    description: [''],
    logo_url:    ['', [Validators.maxLength(512)]],
  });

  private readonly _formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  ngOnInit(): void {
    const b = this.brand();
    this.form.patchValue({
      name:        b.name,
      slug:        b.slug,
      description: b.description ?? '',
      logo_url:    b.logo_url ?? '',
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
    if (ctrl.hasError('pattern')) return 'Use apenas letras minúsculas, números e hífens (ex: minha-marca).';
    return 'Valor inválido.';
  });

  protected readonly logoUrlError = computed(() =>
    this.fieldError('logo_url', ''),
  );

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
      name:        v.name!,
      slug:        v.slug!,
      description: emptyToNull(v.description),
      logo_url:    emptyToNull(v.logo_url),
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
