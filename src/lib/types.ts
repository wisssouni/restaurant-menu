export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  created_at: string;
  category?: Category;
}
