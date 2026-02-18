import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Complaint, ComplaintInput, Status, UserRole } from '../backend';
import { Status as StatusEnum } from '../backend';

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOpenComplaints() {
  const { actor, isFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ['openComplaints'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOpenComplaints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetComplaintsByStatus(status: Status) {
  const { actor, isFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ['complaints', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComplaintsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetComplaint(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Complaint | null>({
    queryKey: ['complaint', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getComplaint(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSubmitComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<ComplaintInput, 'photoId'> & { photoFile: File }) => {
      if (!actor) throw new Error('Actor not available');

      // For now, we'll use a data URL as the photoId since blob storage isn't available
      const photoBytes = await input.photoFile.arrayBuffer();
      const blob = new Blob([photoBytes], { type: input.photoFile.type });
      const photoId = URL.createObjectURL(blob);

      const complaintInput: ComplaintInput = {
        category: input.category,
        description: input.description,
        location: input.location,
        photoId,
        publicId: input.publicId,
      };

      return actor.submitComplaint(complaintInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, afterPhoto }: { id: bigint; status: Status; afterPhoto?: File }) => {
      if (!actor) throw new Error('Actor not available');

      // Note: After photo handling is limited without backend support
      // The backend doesn't have a field to store after photo URLs
      if (afterPhoto && status === StatusEnum.resolved) {
        // We can't store the after photo in the backend currently
        console.warn('After photo uploaded but backend does not support storing after photo URLs');
      }

      await actor.updateStatus(id, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['openComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useEscalateComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.eskalacijaPrijave(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['openComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complaintId,
      comment,
      rating,
      confirmed,
    }: {
      complaintId: bigint;
      comment: string;
      rating: bigint | null;
      confirmed: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.confirmationFeedback(complaintId, comment, rating, confirmed);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.complaintId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['openComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useDuplicateCheck() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (description: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.duplicateCheck(description);
    },
  });
}
