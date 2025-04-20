import { FiltersState } from '@/types/filters';
import { useQuery } from '@tanstack/react-query';
import { fetchProperties } from './property-queries';

export const useProperties = (filters: Partial<FiltersState> = {}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
  });
};
