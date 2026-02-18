import { Link, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import LoginButton from '../auth/LoginButton';
import { Menu, FileText, Home, Upload, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SiGithub } from 'react-icons/si';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const router = useRouterState();
  const isAuthenticated = !!identity;

  const currentPath = router.location.pathname;

  const NavLinks = () => (
    <>
      <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <Home className="h-4 w-4" />
        Home
      </Link>
      {isAuthenticated && (
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
      {isAdmin && (
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
      <Link to="/docs" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <FileText className="h-4 w-4" />
        Docs
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/assets/generated/civic-lens-logo.dim_512x512.png" alt="Civic Lens" className="h-8 w-8" />
              <span className="font-bold text-xl">Civic Lens</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <NavLinks />
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LoginButton />
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8 mt-auto">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Civic Lens. Built with ❤️ using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'civic-lens'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiGithub className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
