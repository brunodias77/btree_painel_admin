import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ResetPasswordForm } from '../reset-password-form/reset-password-form';

@Component({
  selector: 'app-reset-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResetPasswordForm],
  templateUrl: './reset-password-page.html',
})
export class ResetPasswordPage {
  // Bound automatically from ?token=... via withComponentInputBinding()
  readonly token = input<string>('');

  protected readonly currentYear = new Date().getFullYear();
}
