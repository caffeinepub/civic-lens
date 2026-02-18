import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { SiGoogle, SiApple } from 'react-icons/si';

export default function SignInOptions() {
  const { login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  const disabled = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={handleLogin}
        disabled={disabled}
        variant="outline"
        className="flex items-center gap-2 min-w-[180px]"
      >
        {loginStatus === 'logging-in' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <SiGoogle className="h-4 w-4" />
            Continue with Google
          </>
        )}
      </Button>
      <Button
        onClick={handleLogin}
        disabled={disabled}
        variant="outline"
        className="flex items-center gap-2 min-w-[180px]"
      >
        {loginStatus === 'logging-in' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <SiApple className="h-4 w-4" />
            Continue with Apple
          </>
        )}
      </Button>
    </div>
  );
}
