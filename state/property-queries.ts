import { cleanParams } from '@/lib/utils';
import { FiltersState } from '@/types/filters';
import { Property } from '@/types/prismaTypes';
import { appConsole } from '@/utils/console';
import { axiosInstance } from './axios-config';

export const fetchProperties = async (filters: Partial<FiltersState> = {}) => {
  const params = cleanParams({
    location: filters.location,
    priceMin: filters.priceRange?.[0],
    priceMax: filters.priceRange?.[1],
    beds: filters.beds,
    baths: filters.baths,
    propertyType: filters.propertyType,
    squareFeetMin: filters.squareFeet?.[0],
    squareFeetMax: filters.squareFeet?.[1],
    amenities: filters.amenities?.join(','),
    availableFrom: filters.availableFrom,
    favoriteIds: (filters as any).favoriteIds?.join(','),
    latitude: filters.coordinates?.[1],
    longitude: filters.coordinates?.[0],
  });

  // Log the parameters to verify them
  appConsole.info('Request Parameters:', params);

  try {
    const { data } = await axiosInstance.get<Property[]>('properties', {
      params,
    });
    console.log(data, 'WWWWW');
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const fetchProperty = async (id: number): Promise<Property> => {
  try {
    if (!id) return null;
    const { data } = await axiosInstance.get('`properties/${id}`');
    console.log(data, 'dasdasdas');
    return data;
  } catch (error) {}
};
