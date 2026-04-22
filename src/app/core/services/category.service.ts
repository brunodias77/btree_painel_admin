import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryItem, CreateCategoryRequest, CreateCategoryResponse, UpdateCategoryRequest, UpdateCategoryResponse } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  private readonly _loading      = signal(false);
  private readonly _serverErrors = signal<string[]>([]);

  readonly loading      = this._loading.asReadonly();
  readonly serverErrors = this._serverErrors.asReadonly();

  async listAll(): Promise<CategoryItem[]> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.get<CategoryItem[]>(`${environment.apiBaseUrl}/v1/catalog/categories`),
      );
    } catch (err: unknown) {
      this._serverErrors.set(extractErrors(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }
  async update(id: string, request: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.put<UpdateCategoryResponse>(
          `${environment.apiBaseUrl}/v1/catalog/categories/${id}`,
          request,
        ),
      );
    } catch (err: unknown) {
      this._serverErrors.set(extractErrors(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async create(request: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.post<CreateCategoryResponse>(`${environment.apiBaseUrl}/v1/catalog/categories`, request),
      );
    } catch (err: unknown) {
      this._serverErrors.set(extractErrors(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }
}

function extractErrors(err: unknown): string[] {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error: unknown }).error;
    if (body && typeof body === 'object') {
      const api = body as { message?: string; errors?: unknown };
      if (Array.isArray(api.errors) && api.errors.length > 0) {
        return api.errors.map((e: unknown) =>
          typeof e === 'string' ? e : (e as { message?: string })?.message ?? String(e),
        );
      }
      if (typeof api.message === 'string') return [api.message];
    }
  }
  return ['Erro inesperado. Tente novamente.'];
}
