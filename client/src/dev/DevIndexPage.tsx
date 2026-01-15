import { Box, Container, Typography, Link, Paper, Grid, Card, CardContent, CardActionArea } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { DevLayout } from "./DevLayout";

interface DevComponent {
  name: string;
  path: string;
  description: string;
}

const DEV_COMPONENTS: DevComponent[] = [
  {
    name: "Player Card",
    path: "/dev/player-card",
    description: "Test the PlayerCard component with mock data and various player attributes"
  },
  {
    name: "Skill Bar",
    path: "/dev/skill-bar",
    description: "Test the SkillBar component with different skill levels and edge cases"
  },
  {
    name: "Player Avatar",
    path: "/dev/player-avatar",
    description: "Test the PlayerAvatar component with layered images and different sizes"
  }
];

export function DevIndexPage() {
  return (
    <DevLayout>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: "#111827" }}>
            Dev Components
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: "#6b7280" }}>
            Browse and test all available development components. These pages are only available in development mode.
          </Typography>

          <Grid container spacing={3}>
            {DEV_COMPONENTS.map((component) => (
              <Grid item xs={12} sm={6} md={4} key={component.path}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4
                    }
                  }}
                >
                  <CardActionArea
                    component={RouterLink}
                    to={component.path}
                    sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}
                  >
                    <CardContent sx={{ flexGrow: 1, width: "100%" }}>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: "#111827" }}>
                        {component.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        {component.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e5e7eb" }}>
            <Link component={RouterLink} to="/" sx={{ color: "#2563eb", textDecoration: "none" }}>
              ← Back to App
            </Link>
          </Box>
        </Paper>
      </Container>
    </DevLayout>
  );
}
