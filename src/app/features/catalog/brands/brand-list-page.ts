import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BrandService } from '../../../core/services/brand.service';
import { BrandItem } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-brand-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './brand-list-page.html',
})
export class BrandListPage implements OnInit {
  private readonly router       = inject(Router);
  private readonly brandService = inject(BrandService);

  protected readonly loading      = this.brandService.loading;
  protected readonly serverErrors = this.brandService.serverErrors;
  protected readonly brands       = signal<BrandItem[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.brandService.listAll();
      this.brands.set(result);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  protected navigateToCreate(): void {
    this.router.navigate(['/catalog/brands/create']);
  }

  protected navigateToEdit(brand: BrandItem): void {
    this.router.navigate(['/catalog/brands', brand.id, 'edit'], { state: { brand } });
  }
}
