import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BrandService } from '../../../core/services/brand.service';
import { BrandItem, UpdateBrandRequest } from '../../../core/models/catalog.model';
import { EditBrandForm } from './edit-brand-form/edit-brand-form';

@Component({
  selector: 'app-edit-brand-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditBrandForm],
  templateUrl: './edit-brand-page.html',
})
export class EditBrandPage implements OnInit {
  private readonly router       = inject(Router);
  private readonly brandService = inject(BrandService);

  protected readonly submitting   = this.brandService.loading;
  protected readonly serverErrors = this.brandService.serverErrors;
  protected readonly brand        = signal<BrandItem | null>(null);

  ngOnInit(): void {
    const state = history.state as { brand?: BrandItem };
    if (!state?.brand) {
      this.router.navigate(['/catalog/brands']);
      return;
    }
    this.brand.set(state.brand);
  }

  async onSubmit(request: UpdateBrandRequest): Promise<void> {
    const b = this.brand();
    if (!b) return;
    try {
      await this.brandService.update(b.id, request);
      await this.router.navigate(['/catalog/brands']);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  onCancel(): void {
    this.router.navigate(['/catalog/brands']);
  }
}
