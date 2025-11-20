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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0a0e27",
        backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)"
      }}
    >
      <AppBar>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: "0.5px",
              color: "#e2e8f0"
            }}
          >
            Hattrick Manager
          </Typography>
          {pages.map((page) => (
            <Button
              key={page.path}
              component={RouterLink}
              to={page.path}
              sx={{
                ml: 1,
                color: location.pathname === page.path ? "#4299e1" : "#cbd5e0",
                fontWeight: location.pathname === page.path ? 600 : 500,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "#4299e1",
                  background: "rgba(66, 153, 225, 0.1)"
                }
              }}
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
        sx={{
          py: 3,
          textAlign: "center",
          bgcolor: "#0f1428",
          borderTop: "1px solid rgba(66, 153, 225, 0.2)",
          mt: "auto"
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(203, 213, 224, 0.6)",
            fontSize: "0.875rem"
          }}
        >
          ⚽️ Hattrick Manager v0.1 — stay sharp, coach!
        </Typography>
      </Box>
    </Box>
  );
}
