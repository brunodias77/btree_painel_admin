import { Injectable } from '@angular/core';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  type?: 'standard' | 'icon';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  locale?: string;
  width?: number;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (res: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }): void;
          renderButton(parent: HTMLElement, options: GoogleButtonConfig): void;
          cancel(): void;
        };
      };
    };
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private _loaded = false;

  async renderSignInButton(
    element: HTMLElement,
    clientId: string,
    onToken: (idToken: string) => void,
  ): Promise<void> {
    await this.ensureScriptLoaded();
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => onToken(credential),
      auto_select: false,
    });
    window.google!.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'continue_with',
      locale: 'pt_BR',
      width: element.offsetWidth || 360,
    });
  }

  cancel(): void {
    window.google?.accounts.id.cancel();
  }

  private ensureScriptLoaded(): Promise<void> {
    if (this._loaded) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this._loaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Falha ao carregar Google Sign-In.'));
      document.head.appendChild(script);
    });
  }
}
