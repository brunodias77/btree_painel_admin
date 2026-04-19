import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TwoFactorVerifyForm } from './two-factor-verify-form/two-factor-verify-form';

@Component({
  selector: 'app-two-factor-verify-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TwoFactorVerifyForm],
  templateUrl: './two-factor-verify-page.html',
})
export class TwoFactorVerifyPage {
  // Bound automatically from ?transactionId=xxx via withComponentInputBinding()
  readonly transactionId = input<string>('');

  protected readonly currentYear = new Date().getFullYear();
}
