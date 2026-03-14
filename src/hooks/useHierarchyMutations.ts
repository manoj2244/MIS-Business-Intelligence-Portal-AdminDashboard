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
} from '../services/hierarchyApi';

export const useCreateRegionMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => createRegion(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['regions'] }); },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useCreateClusterMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => createCluster(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clusters'] }); },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useCreateBranchMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => createBranch(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useAssignBranchMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => createBranchMapping(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mappings'] });
      qc.invalidateQueries({ queryKey: ['branches'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useMoveBranchMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ branchCode, ...payload }: any) => moveBranchMapping(branchCode, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mappings'] });
      qc.invalidateQueries({ queryKey: ['branches'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useEditRegionMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ code, ...payload }: any) => editRegion(code, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['regions'] }); },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useEditClusterMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ code, ...payload }: any) => editCluster(code, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clusters'] }); },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useEditBranchMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ code, ...payload }: any) => editBranch(code, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useToggleMappingMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: any) => toggleMapping(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mappings'] }); },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};

export const useSplitClusterMutation = () => {
  const qc = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ clusterCode, ...payload }: any) => splitCluster(clusterCode, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clusters'] });
      qc.invalidateQueries({ queryKey: ['branches'] });
      qc.invalidateQueries({ queryKey: ['mappings'] });
    },
  });
  return { mutate, mutateAsync, loading: isPending, error };
};
