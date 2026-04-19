import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  protected readonly sidebarOpen = signal(false);

  protected readonly userInitial = computed(() =>
    this.auth.user()?.username?.charAt(0)?.toUpperCase() ?? '?',
  );

  protected readonly sidebarClasses = computed(() =>
    [
      'fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col bg-zinc-900',
      'transition-transform duration-300 ease-in-out',
      'lg:relative lg:translate-x-0',
      this.sidebarOpen() ? 'translate-x-0' : '-translate-x-full',
    ].join(' '),
  );

  protected toggle(): void {
    this.sidebarOpen.update(v => !v);
  }

  protected close(): void {
    this.sidebarOpen.set(false);
  }
}
