import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartResponse } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/v1/cart`;

  getCart(userId: string): Promise<CartResponse> {
    return firstValueFrom(
      this.http.get<CartResponse>(this.base, {
        headers: { 'X-User-Id': userId },
      }),
    );
  }
}
