import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdjustStockRequest, AdjustStockResponse, CreateProductRequest, CreateProductResponse, ProductDetail, ProductListResponse, StockMovementsResponse, UpdateProductRequest } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly _loading      = signal(false);
  private readonly _serverErrors = signal<string[]>([]);

  readonly loading      = this._loading.asReadonly();
  readonly serverErrors = this._serverErrors.asReadonly();

  async create(request: CreateProductRequest): Promise<CreateProductResponse> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.post<CreateProductResponse>(`${environment.apiBaseUrl}/v1/catalog/products`, request),
      );
    } catch (err: unknown) {
      this._serverErrors.set(extractErrors(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async update(id: string, request: UpdateProductRequest): Promise<ProductDetail> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.patch<ProductDetail>(`${environment.apiBaseUrl}/v1/catalog/products/${id}`, request),
      );
    } catch (err: unknown) {
      this._serverErrors.set(extractErrors(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async getById(id: string): Promise<ProductDetail> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.get<ProductDetail>(`${environment.apiBaseUrl}/v1/catalog/products/${id}`),
      );
    } catch (err: unknown) {
      this._serverErrors.set(extractErrors(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async adjustStock(productId: string, request: AdjustStockRequest): Promise<AdjustStockResponse> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      return await firstValueFrom(
        this.http.post<AdjustStockResponse>(
          `${environment.apiBaseUrl}/v1/catalog/products/${productId}/stock/adjustments`,
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

  async listStockMovements(productId: string, page = 0, size = 20): Promise<StockMovementsResponse> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      const params = new HttpParams().set('page', page).set('size', size);
      return await firstValueFrom(
        this.http.get<StockMovementsResponse>(
          `${environment.apiBaseUrl}/v1/catalog/products/${productId}/stock/movements`,
          { params },
        ),
      );
    } catch (err: unknown) {
      this._serverErrors.set(extractErrors(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async listAll(page = 0, size = 20): Promise<ProductListResponse> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      const params = new HttpParams().set('page', page).set('size', size);
      return await firstValueFrom(
        this.http.get<ProductListResponse>(`${environment.apiBaseUrl}/v1/catalog/products`, { params }),
      );
    } catch (err: unknown) {
      this._serverErrors.set(extractErrors(err));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async listByCategory(categoryId: string, page = 0, size = 20): Promise<ProductListResponse> {
    this._loading.set(true);
    this._serverErrors.set([]);
    try {
      const params = new HttpParams().set('page', page).set('size', size);
      return await firstValueFrom(
        this.http.get<ProductListResponse>(
          `${environment.apiBaseUrl}/v1/catalog/products/by-category/${categoryId}`,
          { params },
        ),
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
