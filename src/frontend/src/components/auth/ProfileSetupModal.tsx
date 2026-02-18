import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import { useVerifyPassword } from '../../hooks/useQueries';
import type { ProfileSetupModalProps } from './ProfileSetupModal.types';

export default function ProfileSetupModal({ open, onSuccess }: ProfileSetupModalProps) {
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const verifyMutation = useVerifyPassword();

  const isLoading = verifyMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

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
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setValidationError('');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-6 w-6 text-primary" />
            <DialogTitle>Enter Your Password</DialogTitle>
          </div>
          <DialogDescription>
            Please enter your password to continue using Civic Lens.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="password">Your Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

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
                Verifying...
              </>
            ) : (
              <>Continue</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
