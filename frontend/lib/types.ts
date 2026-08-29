export type Locale = "en" | "es";

export type PropertyImage = {
  id: number;
  url: string;
  caption: string;
  room: string;
  order: number;
};

export type TourScene = {
  id: number;
  scene_id: string;
  room_name: string;
  url: string;
  initial_yaw: number;
  initial_pitch: number;
  hotspots: { yaw: number; pitch: number; target: string; text: string }[];
  order: number;
};

export type Agent = {
  id: number;
  name: string;
  slug: string;
  title: string;
  photo_url: string;
  bio_en: string;
  bio_es: string;
  phone: string;
  email: string;
  license_number: string;
  specialties: string[];
  neighborhoods: string[];
  career_stats: Record<string, string | number>;
};

export type Property = {
  id: number;
  slug: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  price: number;
  listing_type: "buy" | "rent";
  status: "new" | "open_house" | "price_reduced" | "pending" | "coming_soon" | "sold";
  property_type: "single_family" | "condo" | "townhome" | "estate";
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  lot_size: number;
  year_built: number | null;
  hoa_fee: number | null;
  is_featured: boolean;
  open_house_at: string | null;
  community_slug: string | null;
  community_name: string | null;
  agent_slug: string | null;
  agent_name: string | null;
  has_tour: boolean;
  price_per_sqft: number | null;
  images: PropertyImage[];
  created_at: string;
  // detail only
  description_en?: string;
  description_es?: string;
  highlights?: string[];
  features?: string[];
  agent?: Agent | null;
  tour_scenes?: TourScene[];
};

export type Community = {
  id: number;
  name: string;
  slug: string;
  state: string;
  hero_image: string;
  tagline_en: string;
  tagline_es: string;
  description_en: string;
  description_es: string;
  latitude: number | null;
  longitude: number | null;
  market_data: {
    median_price?: number;
    active_listings?: number;
    median_dom?: number;
    price_per_sqft?: number;
    yoy_change?: number;
  };
  lifestyle_info: { category: string; items: string[] }[];
  is_featured: boolean;
  active_listings: number;
};

export type Article = {
  id: number;
  slug: string;
  title_en: string;
  title_es: string;
  excerpt_en: string;
  excerpt_es: string;
  body_en?: string;
  body_es?: string;
  cover_image: string;
  category: "market_report" | "neighborhood_guide" | "buying_guide" | "selling_guide";
  read_minutes: number;
  published_at: string;
  author?: Agent | null;
};

export type TickerItem = { label: string; value: string; change?: string; trend?: string };
export type TickerPayload = { updated_at: string; source: string; live?: boolean; items: TickerItem[] };

export type ValuationResult = {
  estimated_min: number;
  estimated_max: number;
  estimated_mid: number;
  currency: string;
  price_per_sqft: number | null;
  zone: { slug: string; label: string; baseline_price_per_sqft: number };
  breakdown: { label: string; value: string | number }[];
  disclaimer: string;
};
