export interface CreateBrandRequest {
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
}

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateBrandRequest {
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
}

export interface UpdateBrandResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}
