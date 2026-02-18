import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserRole, useHasPasswordRegistered } from './hooks/useQueries';
import { usePasswordVerification } from './hooks/usePasswordVerification';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import SubmitComplaintPage from './pages/citizen/SubmitComplaintPage';
import MyReportsPage from './pages/citizen/MyReportsPage';
import OfficialDashboardPage from './pages/official/OfficialDashboardPage';
import HigherOfficialDashboardPage from './pages/official/HigherOfficialDashboardPage';
import ComplaintDetailPage from './pages/complaints/ComplaintDetailPage';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import type { PasswordModalMode } from './components/auth/ProfileSetupModal.types';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

function RootLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const submitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit',
  component: SubmitComplaintPage,
});

const myReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-reports',
  component: MyReportsPage,
});

const officialDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/official',
  component: OfficialDashboardPage,
});

const higherOfficialDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/higher-official',
  component: HigherOfficialDashboardPage,
});

const complaintDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/complaint/$id',
  component: ComplaintDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  submitRoute,
  myReportsRoute,
  officialDashboardRoute,
  higherOfficialDashboardRoute,
  complaintDetailRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: hasPassword, isLoading: passwordCheckLoading, isFetched: passwordCheckFetched } = useHasPasswordRegistered();
  const { isVerified, markAsVerified } = usePasswordVerification();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<PasswordModalMode>('registration');

  const isAuthenticated = !!identity;

  // Determine if we should show the password modal
  // Note: Password feature is optional until backend is updated
  useEffect(() => {
    if (!isAuthenticated) {
      setModalOpen(false);
      return;
    }

    if (roleLoading || passwordCheckLoading) {
      return;
    }

    if (!passwordCheckFetched) {
      return;
    }

    // Only show password modal if backend supports it (hasPassword will be true/false, not undefined)
    // If hasPassword is false (no password set), backend supports passwords
    if (hasPassword === false) {
      setModalMode('registration');
      setModalOpen(true);
      return;
    }

    // User has a password but hasn't verified in this session
    if (hasPassword === true && !isVerified) {
      setModalMode('verification');
      setModalOpen(true);
      return;
    }

    // User is fully authenticated and verified (or password feature not enabled)
    setModalOpen(false);
  }, [isAuthenticated, hasPassword, isVerified, roleLoading, passwordCheckLoading, passwordCheckFetched]);

  const handlePasswordSuccess = () => {
    if (modalMode === 'registration') {
      // After registration, move to verification
      setModalMode('verification');
    } else {
      // After verification, mark as verified and close modal
      markAsVerified();
      setModalOpen(false);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      {isAuthenticated && (
        <ProfileSetupModal
          open={modalOpen}
          mode={modalMode}
          onSuccess={handlePasswordSuccess}
        />
      )}
      <Toaster />
    </ThemeProvider>
  );
}
