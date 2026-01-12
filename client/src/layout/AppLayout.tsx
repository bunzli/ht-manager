import { PropsWithChildren } from "react";
import { AppBar, Box, Button, Container, Toolbar, Typography, CircularProgress, Snackbar } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useSync } from "../features/players/hooks/useSync";

type AppLayoutProps = PropsWithChildren;

const pages = [
  { label: "Players", path: "/" },
  { label: "Matches", path: "/matches" }
];

export function AppLayout({ children }: AppLayoutProps) {
  const { sync, isPending, snackbarMessage, clearSnackbar } = useSync();
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
          <Button
            variant="contained"
            startIcon={isPending ? <CircularProgress size={20} sx={{ color: "#ffffff" }} /> : <Refresh />}
            onClick={sync}
            disabled={isPending}
            sx={{
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: "0.875rem",
              ml: 2
            }}
          >
            Fetch updates
          </Button>
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
      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={6000}
        onClose={clearSnackbar}
        message={snackbarMessage ?? ""}
        ContentProps={{
          sx: {
            bgcolor: "#0f1428",
            border: "1px solid rgba(66, 153, 225, 0.2)",
            borderRadius: 2,
            color: "#cbd5e0"
          }
        }}
      />
    </Box>
  );
}
