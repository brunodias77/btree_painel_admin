import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BrandService } from '../brand.service';
import { CreateBrandRequest } from '../../../../core/models/catalog.model';
import { CreateBrandForm } from '../components/create-brand-form/create-brand-form';

@Component({
  selector: 'app-create-brand-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CreateBrandForm, RouterLink],
  templateUrl: './create-brand-page.html',
})
export class CreateBrandPage {
  private readonly router       = inject(Router);
  private readonly brandService = inject(BrandService);

  protected readonly submitting   = this.brandService.loading;
  protected readonly serverErrors = this.brandService.serverErrors;

  async onSubmit(request: CreateBrandRequest): Promise<void> {
    try {
      await this.brandService.create(request);
      await this.router.navigate(['/dashboard']);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
