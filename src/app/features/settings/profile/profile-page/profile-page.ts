import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileHeader } from '../components/profile-header/profile-header';
import { ProfileInfoSection } from '../components/profile-info-section/profile-info-section';
import { AddressSection } from '../components/address-section/address-section';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProfileHeader, ProfileInfoSection, AddressSection],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  private readonly authService = inject(AuthService);

  protected readonly user = this.authService.user;

  protected readonly profileResource = resource({
    loader: () => this.authService.getProfile(),
  });
}
