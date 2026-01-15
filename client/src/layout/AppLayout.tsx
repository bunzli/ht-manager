import { PropsWithChildren, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useSync } from "../features/players/hooks/useSync";

type AppLayoutProps = PropsWithChildren;

const pages = [
  { label: "Players", path: "/" },
  { label: "Matches", path: "/matches" },
  { label: "Database", path: "/db-browser" }
];

export function AppLayout({ children }: AppLayoutProps) {
  const { sync, isPending, snackbarMessage, clearSnackbar } = useSync();
  const location = useLocation();

  // Show toast when snackbarMessage changes
  useEffect(() => {
    if (snackbarMessage) {
      toast(snackbarMessage);
      clearSnackbar();
    }
  }, [snackbarMessage, clearSnackbar]);

  return (
    <div className="min-h-screen bg-background bg-background-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-gradient-to-br from-card to-[#1a1f3a] shadow-card">
        <div className="flex h-16 items-center px-4 md:px-6">
          <h1 className="flex-1 text-lg font-bold tracking-wide text-foreground">
            Hattrick Manager
          </h1>
          <nav className="flex items-center gap-1">
            {pages.map((page) => (
              <Button
                key={page.path}
                variant="ghost"
                asChild
                className={cn(
                  "text-sm font-medium uppercase tracking-wider",
                  location.pathname === page.path
                    ? "text-primary font-semibold"
                    : "text-muted"
                )}
              >
                <RouterLink to={page.path}>{page.label}</RouterLink>
              </Button>
            ))}
          </nav>
          <Button
            onClick={sync}
            disabled={isPending}
            className="ml-4 text-sm uppercase tracking-wider"
          >
            {isPending ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Fetch updates
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto max-w-7xl px-4 py-6 md:px-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Hattrick Manager v0.1 — stay sharp, coach!
        </p>
      </footer>
    </div>
  );
}
