import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Complaint, ComplaintInput, Status, UserRole } from '../backend';
import { Status as StatusEnum, ExternalBlob } from '../backend';
import { toast } from 'sonner';

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

      try {
        // Generate a unique photo identifier
        const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Convert File to bytes
        const photoBytes = new Uint8Array(await input.photoFile.arrayBuffer());

        // Create ExternalBlob with upload progress tracking
        const externalBlob = ExternalBlob.fromBytes(photoBytes).withUploadProgress((percentage) => {
          console.log(`Upload progress: ${percentage}%`);
        });

        // Store the photo in backend
        await actor.storePhoto(photoId, externalBlob);

        // Submit the complaint with the persistent photo identifier
        const complaintInput: ComplaintInput = {
          category: input.category,
          description: input.description,
          location: input.location,
          photoId,
          publicId: input.publicId,
        };

        return actor.submitComplaint(complaintInput);
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to upload photo and submit complaint';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      toast.error('Failed to submit complaint', {
        description: error.message || 'Please try again',
      });
    },
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, afterPhoto }: { id: bigint; status: Status; afterPhoto?: File }) => {
      if (!actor) throw new Error('Actor not available');

      try {
        // If resolving with an after photo, store it first
        if (afterPhoto && status === StatusEnum.resolved) {
          // Generate a unique after photo identifier
          const afterPhotoId = `after-photo-${Date.now()}-${Math.random().toString(36).substring(7)}`;

          // Convert File to bytes
          const photoBytes = new Uint8Array(await afterPhoto.arrayBuffer());

          // Create ExternalBlob with upload progress tracking
          const externalBlob = ExternalBlob.fromBytes(photoBytes).withUploadProgress((percentage) => {
            console.log(`After photo upload progress: ${percentage}%`);
          });

          // Store the after photo in backend
          await actor.storeAfterPhoto(id, afterPhotoId, externalBlob);
        }

        // Update the complaint status
        await actor.updateStatus(id, status);
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to update complaint status';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['openComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update status', {
        description: error.message || 'Please try again',
      });
    },
  });
}

export function useGetPhotoUrl(photoId: string | null | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['photoUrl', photoId],
    queryFn: async () => {
      if (!actor || !photoId) return null;
      try {
        const externalBlob = await actor.fetchAfterPhoto(photoId);
        return externalBlob.getDirectURL();
      } catch (error) {
        console.error('Failed to fetch photo:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!photoId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
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

// Password-related hooks
// Note: These methods are not yet implemented in the backend
// They will return default values until backend is updated
export function useHasPasswordRegistered() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasPasswordRegistered'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        // Check if method exists on actor
        if ('hasPasswordRegistered' in actor && typeof (actor as any).hasPasswordRegistered === 'function') {
          return await (actor as any).hasPasswordRegistered();
        }
        // Method not implemented yet, return false (no password required)
        return false;
      } catch (error) {
        console.error('Error checking password registration:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useRegisterPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Check if method exists on actor
        if ('registerPassword' in actor && typeof (actor as any).registerPassword === 'function') {
          await (actor as any).registerPassword(password);
        } else {
          throw new Error('Password registration is not yet available. Please contact support.');
        }
      } catch (error: any) {
        // Extract user-friendly error message
        const errorMessage = error?.message || 'Failed to register password';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasPasswordRegistered'] });
    },
  });
}

export function useVerifyPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Check if method exists on actor
        if ('verifyPassword' in actor && typeof (actor as any).verifyPassword === 'function') {
          const isValid = await (actor as any).verifyPassword(password);
          if (!isValid) {
            throw new Error('Incorrect password');
          }
          return isValid;
        } else {
          throw new Error('Password verification is not yet available. Please contact support.');
        }
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to verify password';
        throw new Error(errorMessage);
      }
    },
  });
}
