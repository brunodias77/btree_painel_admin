import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // ── Rotas públicas (sem layout) ────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login-page').then(m => m.LoginPage),
  },
  {
    path: 'login/2fa',
    loadComponent: () =>
      import('./features/auth/two-factor-verify/two-factor-verify-page').then(m => m.TwoFactorVerifyPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register-page').then(m => m.RegisterPage),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email-page').then(m => m.VerifyEmailPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password-page').then(m => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password-page').then(m => m.ResetPasswordPage),
  },

  // ── Rotas protegidas (com AdminLayout) ─────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then(m => m.DashboardPage),
      },
      {
        path: 'settings/profile',
        loadComponent: () =>
          import('./features/settings/profile/profile-page').then(m => m.ProfilePage),
      },
      {
        path: 'settings/profile/edit',
        loadComponent: () =>
          import('./features/settings/profile/profile-edit-page').then(m => m.ProfileEditPage),
      },
      {
        path: 'settings/two-factor',
        loadComponent: () =>
          import('./features/settings/two-factor-setup/two-factor-setup-page').then(m => m.TwoFactorSetupPage),
      },
      {
        path: 'catalog/categories',
        loadComponent: () =>
          import('./features/catalog/categories/category-list-page').then(m => m.CategoryListPage),
      },
      {
        path: 'catalog/categories/create',
        loadComponent: () =>
          import('./features/catalog/categories/create-category-page').then(m => m.CreateCategoryPage),
      },
      {
        path: 'catalog/products',
        loadComponent: () =>
          import('./features/catalog/products/product-list-page').then(m => m.ProductListPage),
      },
      {
        path: 'catalog/products/create',
        loadComponent: () =>
          import('./features/catalog/products/create-product-page').then(m => m.CreateProductPage),
      },
      {
        path: 'catalog/brands',
        loadComponent: () =>
          import('./features/catalog/brands/brand-list-page').then(m => m.BrandListPage),
      },
      {
        path: 'catalog/brands/:id/edit',
        loadComponent: () =>
          import('./features/catalog/brands/edit-brand-page').then(m => m.EditBrandPage),
      },
      {
        path: 'catalog/brands/create',
        loadComponent: () =>
          import('./features/catalog/brands/create-brand-page').then(m => m.CreateBrandPage),
      },
      // ── Loja (e-commerce) ──────────────────────────────────────
      {
        path: 'loja',
        redirectTo: 'loja/produtos',
        pathMatch: 'full',
      },
      {
        path: 'loja/produtos',
        loadComponent: () =>
          import('./features/ecommerce/products/products-page').then(m => m.ProductsPage),
      },
      {
        path: 'loja/produtos/:id',
        loadComponent: () =>
          import('./features/ecommerce/product-detail/product-detail-page').then(m => m.ProductDetailPage),
      },
      {
        path: 'loja/favoritos',
        loadComponent: () =>
          import('./features/ecommerce/favorites/favorites-page').then(m => m.FavoritesPage),
      },
      {
        path: 'loja/carrinho',
        loadComponent: () =>
          import('./features/ecommerce/cart/cart-page').then(m => m.CartPage),
      },
      {
        path: 'loja/checkout',
        loadComponent: () =>
          import('./features/ecommerce/checkout/checkout-page').then(m => m.CheckoutPage),
      },
    ],
  },

  { path: '**', redirectTo: '/login' },
];
