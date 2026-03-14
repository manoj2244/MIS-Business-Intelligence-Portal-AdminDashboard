import { useQuery } from '@tanstack/react-query';
import { getBranches, getClusters, getMappings, getRegions } from '../services/hierarchyApi';

export const useRegionsQuery = (enabled = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['regions'],
    queryFn: () => getRegions(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  return { data: data || [], loading: isLoading, error, refetch };
};

export const useClustersQuery = (regionCode?: string, enabled = true) => {
  const normalizedRegionCode = regionCode || undefined;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['clusters', normalizedRegionCode],
    queryFn: () => getClusters({ regionCode: normalizedRegionCode }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  return { data: data || [], loading: isLoading, error, refetch };
};

export const useBranchesQuery = (q = '', enabled = true) => {
  const normalizedQuery = (q || '').trim();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['branches', normalizedQuery],
    queryFn: () => getBranches({ q: normalizedQuery || undefined }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  return { data: data || [], loading: isLoading, error, refetch };
};

export const useMappingsQuery = (filters: Record<string, any> = {}, enabled = true) => {
  const normalizedFilters = {
    regionCode: filters.regionCode || undefined,
    clusterCode: filters.clusterCode || undefined,
    qBranch: (filters.qBranch || '').trim() || undefined,
    isActive: typeof filters.isActive === 'boolean' ? filters.isActive : undefined,
  };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['mappings', normalizedFilters],
    queryFn: () => getMappings(normalizedFilters),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  return { data: data || [], loading: isLoading, error, refetch };
};
