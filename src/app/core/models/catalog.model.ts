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

export interface UpdateCategoryRequest {
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order: number;
}

export interface UpdateCategoryResponse {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
}

export interface CreateCategoryResponse {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryItem {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  children: CategoryItem[];
}

export type ProductStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PAUSED'
  | 'OUT_OF_STOCK'
  | 'DISCONTINUED'
  | 'ARCHIVED';

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  sku: string;
  price: number;
  compare_at_price: number | null;
  status: ProductStatus;
  featured: boolean;
  primary_image_url: string | null;
}

export interface ProductListResponse {
  items: ProductItem[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

/** Imagem enviada na criação de produto. Ordem no array determina sortOrder e primary (primeiro = primary). */
export interface ProductImageEntry {
  url: string;
  alt_text?: string | null;
  sort_order?: number;
}

export interface CreateProductRequest {
  category_id?: string | null;
  brand_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  sku: string;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  low_stock_threshold: number;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  images: ProductImageEntry[];
}

export interface ProductImageOutput {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  primary: boolean;
}

export interface ProductDetail {
  id: string;
  category_id: string | null;
  brand_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  quantity: number;
  low_stock_threshold: number;
  weight: number | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  status: ProductStatus;
  featured: boolean;
  images: ProductImageOutput[];
  created_at: string;
  updated_at: string;
}

export interface UpdateProductRequest {
  category_id?: string | null;
  brand_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  sku: string;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  low_stock_threshold: number;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  featured: boolean;
}

export type StockMovementType = 'IN' | 'OUT' | 'RESERVE' | 'RELEASE' | 'ADJUSTMENT' | 'RETURN';

export interface StockMovementItem {
  id: string;
  movement_type: StockMovementType;
  quantity: number;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
}

export interface StockMovementsResponse {
  items: StockMovementItem[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

export interface AdjustStockRequest {
  delta: number;
  movementType: StockMovementType;
  notes?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
}

export interface AdjustStockResponse {
  movementId: string;
  productId: string;
  movementType: StockMovementType;
  delta: number;
  quantityAfter: number;
  productStatus: string;
  createdAt: string;
}

export interface CreateProductResponse {
  id: string;
  category_id: string | null;
  brand_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  quantity: number;
  low_stock_threshold: number;
  weight: number | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  status: ProductStatus;
  featured: boolean;
  images: ProductImageOutput[];
  created_at: string;
  updated_at: string;
}
