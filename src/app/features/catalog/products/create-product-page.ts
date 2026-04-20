import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { BrandService } from '../../../core/services/brand.service';
import { CategoryService } from '../../../core/services/category.service';
import { BrandItem, CategoryItem, CreateProductRequest } from '../../../core/models/catalog.model';
import { CreateProductForm } from './create-product-form/create-product-form';

@Component({
  selector: 'app-create-product-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CreateProductForm],
  templateUrl: './create-product-page.html',
})
export class CreateProductPage implements OnInit {
  private readonly router          = inject(Router);
  private readonly productService  = inject(ProductService);
  private readonly brandService    = inject(BrandService);
  private readonly categoryService = inject(CategoryService);

  protected readonly submitting   = this.productService.loading;
  protected readonly serverErrors = this.productService.serverErrors;

  protected readonly brands     = signal<BrandItem[]>([]);
  protected readonly categories = signal<CategoryItem[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const [brands, categories] = await Promise.all([
        this.brandService.listAll(),
        this.categoryService.listAll(),
      ]);
      this.brands.set(brands);
      this.categories.set(categories);
    } catch {
      // não-crítico — dropdowns ficam vazios
    }
  }

  async onSubmit(request: CreateProductRequest): Promise<void> {
    try {
      await this.productService.create(request);
      await this.router.navigate(['/catalog/products']);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  onCancel(): void {
    this.router.navigate(['/catalog/products']);
  }
}
