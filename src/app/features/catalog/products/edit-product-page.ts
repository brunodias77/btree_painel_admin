import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { BrandService } from '../../../core/services/brand.service';
import { CategoryService } from '../../../core/services/category.service';
import {
  BrandItem,
  CategoryItem,
  ProductDetail,
  UpdateProductRequest,
} from '../../../core/models/catalog.model';
import { EditProductForm } from './edit-product-form/edit-product-form';

@Component({
  selector: 'app-edit-product-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EditProductForm],
  templateUrl: './edit-product-page.html',
})
export class EditProductPage implements OnInit {
  private readonly route           = inject(ActivatedRoute);
  private readonly router          = inject(Router);
  private readonly productService  = inject(ProductService);
  private readonly brandService    = inject(BrandService);
  private readonly categoryService = inject(CategoryService);

  protected readonly submitting   = this.productService.loading;
  protected readonly serverErrors = this.productService.serverErrors;

  protected readonly product    = signal<ProductDetail | null>(null);
  protected readonly brands     = signal<BrandItem[]>([]);
  protected readonly categories = signal<CategoryItem[]>([]);
  protected readonly loadError  = signal<string | null>(null);

  private productId = '';

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/catalog/products']); return; }
    this.productId = id;

    const [productResult] = await Promise.allSettled([
      this.productService.getById(id),
      this.brandService.listAll().then(b => this.brands.set(b)).catch(() => {}),
      this.categoryService.listAll().then(c => this.categories.set(c)).catch(() => {}),
    ]);

    if (productResult.status === 'fulfilled') {
      this.product.set(productResult.value);
    } else {
      this.loadError.set('Não foi possível carregar os dados do produto.');
    }
  }

  async onSubmit(request: UpdateProductRequest): Promise<void> {
    try {
      await this.productService.update(this.productId, request);
      await this.router.navigate(['/catalog/products', this.productId]);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  onCancel(): void {
    this.router.navigate(['/catalog/products', this.productId]);
  }
}
