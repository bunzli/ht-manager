import { PropsWithChildren } from "react";
import { Box, Container, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type DevLayoutProps = PropsWithChildren;

export function DevLayout({ children }: DevLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f9fafb",
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: "#111827" }}>
            Developer Mode
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Link component={RouterLink} to="/dev/player-card" sx={{ color: "#2563eb" }}>
              Player Card
            </Link>
            <Link component={RouterLink} to="/dev/skill-bar" sx={{ color: "#2563eb" }}>
              Skill Bar
            </Link>
            <Link component={RouterLink} to="/" sx={{ color: "#6b7280" }}>
              ← Back to App
            </Link>
          </Box>
        </Box>
        {children}
      </Container>
    </Box>
  );
}
