import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Product } from '../models/ecommerce.model';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tênis Running Pro X',
    slug: 'tenis-running-pro-x',
    description:
      'Tênis de corrida de alta performance com tecnologia de amortecimento avançada e solado de borracha antiderrapante. Ideal para corridas de longa distância com máximo conforto e suporte ao arco do pé.',
    price: 299.9,
    originalPrice: 399.9,
    imageUrl: 'https://picsum.photos/seed/shoe1/600/600',
    images: [
      'https://picsum.photos/seed/shoe1/600/600',
      'https://picsum.photos/seed/shoe1b/600/600',
      'https://picsum.photos/seed/shoe1c/600/600',
    ],
    category: 'Calçados',
    brand: 'SpeedRun',
    rating: 4.7,
    reviewCount: 128,
    stock: 15,
    tags: ['corrida', 'esporte', 'masculino'],
  },
  {
    id: '2',
    name: 'Sapatênis Casual Urban',
    slug: 'sapatenis-casual-urban',
    description:
      'Sapatênis casual com design urbano moderno. Combina estilo e conforto para o dia a dia, com solado flexível e cabedal em couro sintético de alta qualidade.',
    price: 189.9,
    imageUrl: 'https://picsum.photos/seed/shoe2/600/600',
    images: [
      'https://picsum.photos/seed/shoe2/600/600',
      'https://picsum.photos/seed/shoe2b/600/600',
    ],
    category: 'Calçados',
    brand: 'UrbanStep',
    rating: 4.3,
    reviewCount: 87,
    stock: 22,
    tags: ['casual', 'urbano', 'unissex'],
  },
  {
    id: '3',
    name: 'Chinelo Sport Slide',
    slug: 'chinelo-sport-slide',
    description:
      'Chinelo slide esportivo com tira anatômica e palmilha em EVA macio. Perfeito para academia, praia e uso casual pós-treino.',
    price: 79.9,
    originalPrice: 99.9,
    imageUrl: 'https://picsum.photos/seed/sandal3/600/600',
    images: [
      'https://picsum.photos/seed/sandal3/600/600',
    ],
    category: 'Calçados',
    brand: 'SpeedRun',
    rating: 4.5,
    reviewCount: 214,
    stock: 50,
    tags: ['slide', 'esporte', 'praia'],
  },
  {
    id: '4',
    name: 'Fone Bluetooth Pro Elite',
    slug: 'fone-bluetooth-pro-elite',
    description:
      'Fone de ouvido over-ear com cancelamento ativo de ruído e driver de 40mm. Bateria de 30h de duração, conexão Bluetooth 5.3 e qualidade de áudio Hi-Res certificada.',
    price: 449.9,
    originalPrice: 599.9,
    imageUrl: 'https://picsum.photos/seed/headphone4/600/600',
    images: [
      'https://picsum.photos/seed/headphone4/600/600',
      'https://picsum.photos/seed/headphone4b/600/600',
    ],
    category: 'Eletrônicos',
    brand: 'SoundMax',
    rating: 4.8,
    reviewCount: 356,
    stock: 8,
    tags: ['audio', 'bluetooth', 'premium'],
  },
  {
    id: '5',
    name: 'Smartwatch Elite Series 3',
    slug: 'smartwatch-elite-series-3',
    description:
      'Smartwatch com tela AMOLED 1.4", GPS integrado, monitor cardíaco 24h, SpO2 e mais de 100 modos esportivos. Resistente à água até 5ATM.',
    price: 799.9,
    originalPrice: 999.9,
    imageUrl: 'https://picsum.photos/seed/watch5/600/600',
    images: [
      'https://picsum.photos/seed/watch5/600/600',
      'https://picsum.photos/seed/watch5b/600/600',
    ],
    category: 'Eletrônicos',
    brand: 'TechWear',
    rating: 4.6,
    reviewCount: 193,
    stock: 12,
    tags: ['smartwatch', 'fitness', 'gps'],
  },
  {
    id: '6',
    name: 'Caixa de Som Portátil 360°',
    slug: 'caixa-de-som-portatil-360',
    description:
      'Caixa de som portátil com som 360° e graves potentes. Bluetooth 5.0, IPX7 à prova d\'água, 20h de bateria e entrada USB-C para carregamento rápido.',
    price: 259.9,
    imageUrl: 'https://picsum.photos/seed/speaker6/600/600',
    images: [
      'https://picsum.photos/seed/speaker6/600/600',
    ],
    category: 'Eletrônicos',
    brand: 'SoundMax',
    rating: 4.4,
    reviewCount: 142,
    stock: 30,
    tags: ['caixa-de-som', 'portatil', 'bluetooth'],
  },
  {
    id: '7',
    name: 'Camiseta Dry-Fit Performance',
    slug: 'camiseta-dry-fit-performance',
    description:
      'Camiseta esportiva com tecido dry-fit de secagem rápida e proteção UV 50+. Corte ergonômico para máxima mobilidade durante treinos intensos.',
    price: 59.9,
    originalPrice: 79.9,
    imageUrl: 'https://picsum.photos/seed/shirt7/600/600',
    images: [
      'https://picsum.photos/seed/shirt7/600/600',
      'https://picsum.photos/seed/shirt7b/600/600',
    ],
    category: 'Roupas',
    brand: 'AthleteWear',
    rating: 4.5,
    reviewCount: 312,
    stock: 100,
    tags: ['camiseta', 'treino', 'dry-fit'],
  },
  {
    id: '8',
    name: 'Moletom Urban Hoodie',
    slug: 'moletom-urban-hoodie',
    description:
      'Moletom unissex com capuz em fleece de algodão premium. Bolso canguru, punhos e barra em ribana. Design oversized moderno para uso casual e esportivo.',
    price: 149.9,
    originalPrice: 199.9,
    imageUrl: 'https://picsum.photos/seed/hoodie8/600/600',
    images: [
      'https://picsum.photos/seed/hoodie8/600/600',
    ],
    category: 'Roupas',
    brand: 'UrbanStep',
    rating: 4.6,
    reviewCount: 178,
    stock: 45,
    tags: ['moletom', 'casual', 'unissex'],
  },
  {
    id: '9',
    name: 'Shorts Treino Pro 2 em 1',
    slug: 'shorts-treino-pro-2-em-1',
    description:
      'Shorts de treino com bermuda externa e compressor interno. Tecido leve e respirável, bolsos laterais com zíper e elástico com regulagem.',
    price: 89.9,
    imageUrl: 'https://picsum.photos/seed/shorts9/600/600',
    images: [
      'https://picsum.photos/seed/shorts9/600/600',
    ],
    category: 'Roupas',
    brand: 'AthleteWear',
    rating: 4.3,
    reviewCount: 96,
    stock: 60,
    tags: ['shorts', 'treino', 'academia'],
  },
  {
    id: '10',
    name: 'Mochila Sport Ultralight 30L',
    slug: 'mochila-sport-ultralight-30l',
    description:
      'Mochila esportiva de 30 litros com material resistente à água, alças acolchoadas, compartimento para laptop 15", saída para headphone e refletor de segurança.',
    price: 199.9,
    originalPrice: 249.9,
    imageUrl: 'https://picsum.photos/seed/bag10/600/600',
    images: [
      'https://picsum.photos/seed/bag10/600/600',
      'https://picsum.photos/seed/bag10b/600/600',
    ],
    category: 'Acessórios',
    brand: 'TrailGear',
    rating: 4.7,
    reviewCount: 241,
    stock: 18,
    tags: ['mochila', 'esporte', 'viagem'],
  },
  {
    id: '11',
    name: 'Óculos Esportivo Polarizado',
    slug: 'oculos-esportivo-polarizado',
    description:
      'Óculos esportivo com lentes polarizadas e proteção UV400. Armação em TR90 ultraleve e flexível, hastes ajustáveis e nose pad ergonômico.',
    price: 129.9,
    originalPrice: 169.9,
    imageUrl: 'https://picsum.photos/seed/glasses11/600/600',
    images: [
      'https://picsum.photos/seed/glasses11/600/600',
    ],
    category: 'Acessórios',
    brand: 'VisionSport',
    rating: 4.4,
    reviewCount: 73,
    stock: 25,
    tags: ['oculos', 'esporte', 'polarizado'],
  },
  {
    id: '12',
    name: 'Boné Snapback Classic',
    slug: 'bone-snapback-classic',
    description:
      'Boné snapback com aba plana e fechamento ajustável. Bordado em relevo na frente, interior em moletinho macio e viseira em material antisuor.',
    price: 49.9,
    imageUrl: 'https://picsum.photos/seed/cap12/600/600',
    images: [
      'https://picsum.photos/seed/cap12/600/600',
    ],
    category: 'Acessórios',
    brand: 'UrbanStep',
    rating: 4.2,
    reviewCount: 58,
    stock: 80,
    tags: ['bone', 'casual', 'unissex'],
  },
];

@Injectable({ providedIn: 'root' })
export class EcommerceService {
  private readonly _cart = signal<CartItem[]>([]);
  private readonly _favorites = signal<Set<string>>(new Set());

  readonly products = MOCK_PRODUCTS;

  readonly cart = this._cart.asReadonly();
  readonly favorites = this._favorites.asReadonly();

  readonly cartCount = computed(() =>
    this._cart().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly cartTotal = computed(() =>
    this._cart().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  readonly favoriteProducts = computed(() => {
    const favIds = this._favorites();
    return MOCK_PRODUCTS.filter(p => favIds.has(p.id));
  });

  isFavorite(id: string): boolean {
    return this._favorites().has(id);
  }

  toggleFavorite(id: string): void {
    this._favorites.update(favs => {
      const next = new Set(favs);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  addToCart(product: Product, quantity = 1): void {
    this._cart.update(cart => {
      const existing = cart.find(i => i.product.id === product.id);
      if (existing) {
        return cart.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...cart, { product, quantity }];
    });
  }

  removeFromCart(productId: string): void {
    this._cart.update(cart => cart.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._cart.update(cart =>
      cart.map(i => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  }

  clearCart(): void {
    this._cart.set([]);
  }

  getProductById(id: string): Product | undefined {
    return MOCK_PRODUCTS.find(p => p.id === id);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  discount(price: number, original: number): number {
    return Math.round((1 - price / original) * 100);
  }
}
