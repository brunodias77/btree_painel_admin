import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EcommerceService } from '../../../core/services/ecommerce.service';

@Component({
  selector: 'app-favorites-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './favorites-page.html',
})
export class FavoritesPage {
  protected readonly store = inject(EcommerceService);
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly Math = Math;
}
