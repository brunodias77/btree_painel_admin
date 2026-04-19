import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ForgotPasswordForm } from './forgot-password-form/forgot-password-form';

@Component({
  selector: 'app-forgot-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForgotPasswordForm],
  templateUrl: './forgot-password-page.html',
})
export class ForgotPasswordPage {
  protected readonly currentYear = new Date().getFullYear();
}
