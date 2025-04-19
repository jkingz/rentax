import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authQueries } from './auth-queries';

const useInvalidateAuth = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['authUser'] });
};

export const useAuthUser = () => {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: authQueries.getAuthUser,
  });
};

export const useUpdateTenantSettings = () => {
  const invalidateAuth = useInvalidateAuth();

  return useMutation({
    mutationFn: authQueries.updateTenantSettings,
    onSuccess: () => invalidateAuth(),
  });
};

export const useUpdateManagerSettings = () => {
  const invalidateAuth = useInvalidateAuth();

  return useMutation({
    mutationFn: authQueries.updateManagerSettings,
    onSuccess: () => invalidateAuth(),
  });
};
