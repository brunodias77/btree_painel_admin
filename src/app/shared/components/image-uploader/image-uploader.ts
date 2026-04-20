import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { MediaService } from '../../../core/services/media.service';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_BYTES = 10 * 1024 * 1024;

@Component({
  selector: 'app-image-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-uploader.html',
})
export class ImageUploader {
  private readonly mediaService = inject(MediaService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  initialUrl = input<string | null>(null);

  urlChange = output<string | null>();

  protected readonly previewUrl = signal<string | null>(null);
  protected readonly uploading  = this.mediaService.uploading;
  protected readonly error      = signal<string | null>(null);

  ngOnInit(): void {
    this.previewUrl.set(this.initialUrl());
  }

  protected openPicker(): void {
    this.fileInput.nativeElement.click();
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    input.value = '';

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.error.set('Formato não suportado. Use JPEG, PNG, WebP, GIF ou SVG.');
      return;
    }

    if (file.size > MAX_BYTES) {
      this.error.set('Arquivo muito grande. O tamanho máximo é 10 MB.');
      return;
    }

    this.error.set(null);

    try {
      const { url } = await this.mediaService.upload(file);
      this.previewUrl.set(url);
      this.urlChange.emit(url);
    } catch {
      this.error.set('Falha no upload. Tente novamente.');
    }
  }

  protected remove(): void {
    this.previewUrl.set(null);
    this.error.set(null);
    this.urlChange.emit(null);
  }
}
