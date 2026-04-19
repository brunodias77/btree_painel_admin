import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetProfileResponse, User } from '../../../../../core/models/auth.model';

@Component({
  selector: 'app-profile-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8">
      <div class="flex flex-col sm:flex-row sm:items-center gap-6">

        <!-- Avatar -->
        <div class="shrink-0">
          @if (profile()?.avatar_url) {
            <img
              [src]="profile()!.avatar_url!"
              [alt]="profile()?.display_name ?? 'Avatar'"
              class="w-20 h-20 rounded-full object-cover ring-4 ring-zinc-100"
            />
          } @else {
            <div
              class="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center ring-4 ring-zinc-100"
              aria-hidden="true"
            >
              <span class="text-white text-2xl font-bold tracking-tight select-none">
                {{ initials() }}
              </span>
            </div>
          }
        </div>

        <!-- Nome + email + badges -->
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-semibold text-zinc-900 truncate">
            {{ profile()?.display_name || profile()?.first_name || user()?.username || '—' }}
          </h1>
          <p class="text-sm text-zinc-500 mt-0.5 truncate">{{ user()?.email }}</p>

          <div class="flex flex-wrap items-center gap-1.5 mt-3">
            @if (profile()?.preferred_language) {
              <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200">
                {{ profile()!.preferred_language }}
              </span>
            }
            @if (profile()?.preferred_currency) {
              <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200">
                {{ profile()!.preferred_currency }}
              </span>
            }
            @if (profile()?.newsletter_subscribed) {
              <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Newsletter
              </span>
            }
          </div>
        </div>

        <!-- Botão editar -->
        <div class="shrink-0">
          <a
            routerLink="/settings/profile/edit"
            class="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Editar perfil
          </a>
        </div>

      </div>
    </div>
  `,
})
export class ProfileHeader {
  profile = input<GetProfileResponse | undefined>(undefined);
  user    = input<User | null>(null);

  protected readonly initials = computed(() => {
    const p = this.profile();
    const a = p?.first_name?.charAt(0) ?? '';
    const b = p?.last_name?.charAt(0)  ?? '';
    return (a + b).toUpperCase() || this.user()?.username?.charAt(0)?.toUpperCase() || '?';
  });
}
