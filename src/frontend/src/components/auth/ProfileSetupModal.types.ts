export type PasswordModalMode = 'registration' | 'verification';

export interface ProfileSetupModalProps {
  open: boolean;
  mode: PasswordModalMode;
  onSuccess: () => void;
}

export const MIN_PASSWORD_LENGTH = 8;
