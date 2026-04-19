import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { GetProfileResponse } from '../../../../../core/models/auth.model';

@Component({
  selector: 'app-profile-info-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './profile-info-section.html',
})
export class ProfileInfoSection {
  profile = input<GetProfileResponse | undefined>(undefined);

  protected genderLabel(gender: string | null): string {
    const map: Record<string, string> = { F: 'Feminino', M: 'Masculino', OTHER: 'Outro' };
    return gender ? (map[gender] ?? gender) : '—';
  }
}
