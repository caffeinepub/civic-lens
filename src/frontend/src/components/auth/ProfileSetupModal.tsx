import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Lock, KeyRound } from 'lucide-react';
import { useRegisterPassword, useVerifyPassword } from '../../hooks/useQueries';
import type { ProfileSetupModalProps } from './ProfileSetupModal.types';
import { MIN_PASSWORD_LENGTH } from './ProfileSetupModal.types';

export default function ProfileSetupModal({ open, mode, onSuccess }: ProfileSetupModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const registerMutation = useRegisterPassword();
  const verifyMutation = useVerifyPassword();

  const isRegistration = mode === 'registration';
  const isLoading = registerMutation.isPending || verifyMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (isRegistration) {
      // Registration validation
      if (password.length < MIN_PASSWORD_LENGTH) {
        setValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        return;
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }

      try {
        await registerMutation.mutateAsync(password);
        setPassword('');
        setConfirmPassword('');
        onSuccess();
      } catch (error: any) {
        setValidationError(error.message || 'Failed to register password');
      }
    } else {
      // Verification
      if (!password) {
        setValidationError('Please enter your password');
        return;
      }

      try {
        await verifyMutation.mutateAsync(password);
        setPassword('');
        onSuccess();
      } catch (error: any) {
        setValidationError(error.message || 'Incorrect password');
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setValidationError('');
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setValidationError('');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {isRegistration ? (
              <KeyRound className="h-6 w-6 text-primary" />
            ) : (
              <Lock className="h-6 w-6 text-primary" />
            )}
            <DialogTitle>
              {isRegistration ? 'Create Your Password' : 'Enter Your Password'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isRegistration
              ? 'Set up a password to secure your account. You will need this password each time you sign in.'
              : 'Please enter your password to continue using Civic Lens.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {isRegistration ? 'Password' : 'Your Password'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder={isRegistration ? 'Enter password' : 'Enter your password'}
              required
              disabled={isLoading}
              autoComplete={isRegistration ? 'new-password' : 'current-password'}
            />
            {isRegistration && (
              <p className="text-xs text-muted-foreground">
                Must be at least {MIN_PASSWORD_LENGTH} characters long
              </p>
            )}
          </div>

          {isRegistration && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="Re-enter password"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          )}

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRegistration ? 'Creating...' : 'Verifying...'}
              </>
            ) : (
              <>{isRegistration ? 'Create Password' : 'Continue'}</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
