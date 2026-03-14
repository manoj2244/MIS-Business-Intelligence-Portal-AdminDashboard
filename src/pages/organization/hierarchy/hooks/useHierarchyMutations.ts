import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBranch,
  createBranchMapping,
  createCluster,
  createRegion,
  editBranch,
  editCluster,
  editRegion,
  moveBranchMapping,
  splitCluster,
  toggleMapping,
} from '../../../../services/hierarchyApi';

export const useCreateRegionMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => createRegion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useCreateClusterMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => createCluster(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useCreateBranchMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => createBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useAssignBranchMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => createBranchMapping(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useMoveBranchMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ branchCode, ...payload }: any) => moveBranchMapping(branchCode, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useEditRegionMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ code, ...payload }: any) => editRegion(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useEditClusterMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ code, ...payload }: any) => editCluster(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useEditBranchMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ code, ...payload }: any) => editBranch(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useToggleMappingMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => toggleMapping(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useSplitClusterMutation = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ clusterCode, ...payload }: any) => splitCluster(clusterCode, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};
