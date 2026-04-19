import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LoginForm } from './login-form/login-form';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoginForm],
  templateUrl: './login-page.html',
})
export class LoginPage {
  // Bound automatically from ?registered=1 via withComponentInputBinding()
  readonly registered = input<string>('');
  // Bound automatically from ?reset=1 via withComponentInputBinding()
  readonly reset = input<string>('');

  protected readonly currentYear = new Date().getFullYear();
}
