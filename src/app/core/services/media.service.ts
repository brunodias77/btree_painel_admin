import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);

  private readonly _uploading = signal(false);
  readonly uploading = this._uploading.asReadonly();

  async upload(file: File): Promise<UploadResponse> {
    const body = new FormData();
    body.append('file', file);

    this._uploading.set(true);
    try {
      return await firstValueFrom(
        this.http.post<UploadResponse>(`${environment.apiBaseUrl}/v1/media/upload`, body),
      );
    } finally {
      this._uploading.set(false);
    }
  }
}
