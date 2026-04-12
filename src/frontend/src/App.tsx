import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import CustomCursor from "./components/CustomCursor";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Team from "./pages/Team";

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <CustomCursor />
      <Outlet />
    </AuthProvider>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/team",
  component: Team,
});

const routeTree = rootRoute.addChildren([homeRoute, teamRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
