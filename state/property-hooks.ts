import { FiltersState } from '@/types/filters';
import { Property } from '@/types/prismaTypes';
import { useQuery } from '@tanstack/react-query';
import { fetchProperties, fetchProperty } from './property-queries';

export const useProperties = (filters: Partial<FiltersState> = {}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    select: (data) => (Array.isArray(data) ? data : []), // Ensures always an array
  });
};

export const useProperty = (id: number) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
    enabled: Boolean(id),
    select: (property) => property,
  });
};
