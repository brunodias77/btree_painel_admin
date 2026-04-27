export interface CartItemResponse {
  cartItemId: string;
  productId: string;
  productName: string;
  productStatus: string;
  quantity: number;
  unitPrice: number;
  currentPrice: number;
  priceChanged: boolean;
  subtotal: number;
}

export interface CartResponse {
  cartId: string;
  status: string;
  couponCode: string | null;
  shippingMethod: string | null;
  subtotal: number;
  totalItems: number;
  hasPriceChanges: boolean;
  items: CartItemResponse[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}
