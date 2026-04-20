import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryItem } from '../../../core/models/catalog.model';

export interface FlatCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  depth: number;
}

function flatten(items: CategoryItem[], depth = 0): FlatCategory[] {
  return items.flatMap(item => [
    {
      id:          item.id,
      parent_id:   item.parent_id,
      name:        item.name,
      slug:        item.slug,
      description: item.description,
      image_url:   item.image_url,
      sort_order:  item.sort_order,
      active:      item.active,
      depth,
    },
    ...flatten(item.children, depth + 1),
  ]);
}

@Component({
  selector: 'app-category-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './category-list-page.html',
})
export class CategoryListPage implements OnInit {
  private readonly categoryService = inject(CategoryService);

  protected readonly loading      = this.categoryService.loading;
  protected readonly serverErrors = this.categoryService.serverErrors;

  private readonly _categories = signal<CategoryItem[]>([]);
  protected readonly categories = computed(() => flatten(this._categories()));

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.categoryService.listAll();
      this._categories.set(result);
    } catch {
      // erros expostos via serverErrors signal
    }
  }
}
