import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RegisterForm } from '../register-form/register-form';

@Component({
  selector: 'app-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RegisterForm],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  protected readonly currentYear = new Date().getFullYear();
}
