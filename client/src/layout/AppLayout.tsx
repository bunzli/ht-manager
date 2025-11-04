import { PropsWithChildren } from "react";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

type AppLayoutProps = PropsWithChildren;

const pages = [
  { label: "Players", path: "/" },
  { label: "Configuration", path: "/config" }
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hattrick Manager
          </Typography>
          {pages.map((page) => (
            <Button
              key={page.path}
              color={location.pathname === page.path ? "inherit" : "secondary"}
              component={RouterLink}
              to={page.path}
              sx={{ ml: 1 }}
            >
              {page.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{ py: 3, textAlign: "center", bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}
      >
        <Typography variant="body2" color="text.secondary">
          ⚽️ Hattrick Manager v0.1 — stay sharp, coach!
        </Typography>
      </Box>
    </Box>
  );
}
