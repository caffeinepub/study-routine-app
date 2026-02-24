import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubjectsPage from './pages/SubjectsPage';
import CreateTargetPage from './pages/CreateTargetPage';
import CalendarPage from './pages/CalendarPage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const subjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/subjects',
  component: SubjectsPage,
});

const createTargetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-target',
  component: CreateTargetPage,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: CalendarPage,
});

const routeTree = rootRoute.addChildren([indexRoute, subjectsRoute, createTargetRoute, calendarRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
