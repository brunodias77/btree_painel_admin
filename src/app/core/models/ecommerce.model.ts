export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  status?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'pix' | 'boleto' | 'credit_card';
