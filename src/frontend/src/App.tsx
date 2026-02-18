import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserRole } from './hooks/useQueries';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import SubmitComplaintPage from './pages/citizen/SubmitComplaintPage';
import MyReportsPage from './pages/citizen/MyReportsPage';
import OfficialDashboardPage from './pages/official/OfficialDashboardPage';
import HigherOfficialDashboardPage from './pages/official/HigherOfficialDashboardPage';
import ComplaintDetailPage from './pages/complaints/ComplaintDetailPage';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

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

  const isAuthenticated = !!identity;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      {isAuthenticated && !roleLoading && <ProfileSetupModal />}
      <Toaster />
    </ThemeProvider>
  );
}
