import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import SignInOptions from './SignInOptions';

export default function LoginButton() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isAuthenticated) {
    return (
      <Button onClick={handleLogout} variant="outline">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    );
  }

  return <SignInOptions />;
}
