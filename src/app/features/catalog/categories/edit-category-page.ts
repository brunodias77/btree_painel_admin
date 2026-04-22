import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryItem, UpdateCategoryRequest } from '../../../core/models/catalog.model';
import { EditCategoryForm } from './edit-category-form/edit-category-form';

function findById(items: CategoryItem[], id: string): CategoryItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    const found = findById(item.children, id);
    if (found) return found;
  }
  return null;
}

@Component({
  selector: 'app-edit-category-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EditCategoryForm],
  templateUrl: './edit-category-page.html',
})
export class EditCategoryPage implements OnInit {
  private readonly route           = inject(ActivatedRoute);
  private readonly router          = inject(Router);
  private readonly categoryService = inject(CategoryService);

  protected readonly submitting   = this.categoryService.loading;
  protected readonly serverErrors = this.categoryService.serverErrors;

  protected readonly category   = signal<CategoryItem | null>(null);
  protected readonly categories = signal<CategoryItem[]>([]);
  protected readonly notFound   = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/catalog/categories']); return; }

    try {
      const all = await this.categoryService.listAll();
      this.categories.set(all);
      const found = findById(all, id);
      if (!found) { this.notFound.set(true); return; }
      this.category.set(found);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  async onSubmit(request: UpdateCategoryRequest): Promise<void> {
    const id = this.category()?.id;
    if (!id) return;
    try {
      await this.categoryService.update(id, request);
      await this.router.navigate(['/catalog/categories']);
    } catch {
      // erros expostos via serverErrors signal
    }
  }

  onCancel(): void {
    this.router.navigate(['/catalog/categories']);
  }
}
