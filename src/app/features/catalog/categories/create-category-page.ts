import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryItem, CreateCategoryRequest } from '../../../core/models/catalog.model';
import { CreateCategoryForm } from './create-category-form/create-category-form';

@Component({
  selector: 'app-create-category-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CreateCategoryForm],
  templateUrl: './create-category-page.html',
})
export class CreateCategoryPage implements OnInit {
  private readonly router          = inject(Router);
  private readonly categoryService = inject(CategoryService);

  protected readonly submitting   = this.categoryService.loading;
  protected readonly serverErrors = this.categoryService.serverErrors;
  protected readonly categories   = signal<CategoryItem[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.categoryService.listAll();
      this.categories.set(result);
    } catch {
      // lista vazia — formulário permite criar categoria raiz mesmo sem carregar
    }
  }

  async onSubmit(request: CreateCategoryRequest): Promise<void> {
    try {
      await this.categoryService.create(request);
      await this.router.navigate(['/catalog/categories']);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  onCancel(): void {
    this.router.navigate(['/catalog/categories']);
  }
}
