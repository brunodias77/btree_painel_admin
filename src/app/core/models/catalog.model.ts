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
