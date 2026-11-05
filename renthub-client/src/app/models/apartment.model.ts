export interface Apartment {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  state: string | null;
  pincode: string | null;
  monthlyRent: number;
  securityDeposit: number | null;
  bedrooms: number;
  bathrooms: number;
  area: number | null; /// in square feet
  furnished: 'FURNISHED' | 'UNFURNISHED' | 'SEMI_FURNISHED';
  vegetarian: 'ALLOWED' | 'NOT_ALLOWED';
  availability: 'AVAILABLE' | 'PENDING' | 'RENTED';
  images: ApartmentImage[];
  amenities?: any[];
  landlord: {
    id: string;
    fullName: string;
    companyName: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApartmentImage {
  id: string;
  url: string;
  publicId: string | null;
  orderIndex: number;
}

export interface ApartmentFormValues {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  monthlyRent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnished: 'FURNISHED' | 'UNFURNISHED' | 'SEMI_FURNISHED';
  vegetarian: 'ALLOWED' | 'NOT_ALLOWED';
  availability: 'AVAILABLE' | 'PENDING' | 'RENTED';
  amenities: string[];
}

export interface ApartmentFilters {
  city?: string;
  state?: string;
  availability?: 'AVAILABLE' | 'PENDING' | 'RENTED';
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  furnished?: 'FURNISHED' | 'UNFURNISHED' | 'SEMI_FURNISHED';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}