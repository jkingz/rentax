export interface FiltersState {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
  favoriteIds?: number[];
}

export interface GlobalState {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  viewMode: 'grid' | 'list';
}

export type PropertyWithLocation = {
  id: number;
  location: {
    id: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
      longitude: number;
      latitude: number;
    };
  };
  // ... other property fields
};

export const defaultFilters: FiltersState = {
  location: 'teasd',
  beds: 'any',
  baths: 'any',
  propertyType: 'any',
  amenities: [],
  availableFrom: 'any',
  priceRange: [null, null],
  squareFeet: [null, null],
  coordinates: [-118.25, 34.05],
};
