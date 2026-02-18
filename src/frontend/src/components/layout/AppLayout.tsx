import { Link, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useHasPasswordRegistered } from '../../hooks/useQueries';
import { usePasswordVerification } from '../../hooks/usePasswordVerification';
import LoginButton from '../auth/LoginButton';
import { Menu, FileText, Home, Upload, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: hasPassword } = useHasPasswordRegistered();
  const { isVerified } = usePasswordVerification();
  const router = useRouterState();
  const isAuthenticated = !!identity;
  
  // User is fully authenticated if:
  // 1. They have an Internet Identity, AND
  // 2. Either they don't have a password registered, OR they have verified their password
  const isFullyAuthenticated = isAuthenticated && (!hasPassword || isVerified);

  const currentPath = router.location.pathname;

  const NavLinks = () => (
    <>
      <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <Home className="h-4 w-4" />
        Home
      </Link>
      {isFullyAuthenticated && (
        <>
          <Link
            to="/submit"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <Upload className="h-4 w-4" />
            Report Issue
          </Link>
          <Link
            to="/my-reports"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <FileText className="h-4 w-4" />
            My Reports
          </Link>
        </>
      )}
      {isFullyAuthenticated && isAdmin && (
        <>
          <Link
            to="/official"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <Shield className="h-4 w-4" />
            Official Dashboard
          </Link>
          <Link
            to="/higher-official"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Escalated Issues
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/assets/generated/civic-lens-logo.dim_512x512.png" alt="Civic Lens" className="h-8 w-8" />
              <span className="font-bold text-xl">Civic Lens</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-6">
              <NavLinks />
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <LoginButton />
            </div>
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                  <div className="pt-4 border-t">
                    <LoginButton />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
