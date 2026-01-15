import { useState } from "react";
import { Box, Paper, Typography, TextField, Stack, Button, Alert } from "@mui/material";
import { DevLayout } from "./DevLayout";
import { PlayerAvatar } from "../components/PlayerCard";
import type { Avatar } from "../api/players";

// Sample avatar data based on real Hattrick API response
const SAMPLE_AVATAR: Avatar = {
  backgroundImage: "/Img/Avatar/backgrounds/card1.png",
  layers: [
    { image: "/Img/Avatar/backgrounds/bg_blue_int.png", x: 9, y: 10 },
    { image: "/Img/Avatar/bodies/bd3_s1.png", x: 9, y: 10 },
    { image: "/Img/Avatar/faces/f1a.png", x: 9, y: 10 },
    { image: "/Img/Avatar/beards/f1b2e.png", x: 9, y: 10 },
    { image: "/Img/Avatar/eyes/e12a.png", x: 23, y: 24 },
    { image: "/Img/Avatar/mouths/f1bem31c.png", x: 9, y: 10 },
    { image: "/Img/Avatar/noses/f1ben12.png", x: 9, y: 10 },
    { image: "/Img/Avatar/hair/f1h12e.png", x: 9, y: 10 },
    { image: "/Img/Avatar/misc/yellow.png", x: 9, y: 135 },
    { image: "/Img/Avatar/misc/yellow.png", x: 19, y: 135 },
    { image: "/Img/Avatar/numbers/20.png", x: 83, y: 130 }
  ]
};

export function PlayerAvatarDev() {
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(SAMPLE_AVATAR, null, 2));
  const [avatar, setAvatar] = useState<Avatar | null>(SAMPLE_AVATAR);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setAvatar(parsed);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleReset = () => {
    setJsonInput(JSON.stringify(SAMPLE_AVATAR, null, 2));
    setAvatar(SAMPLE_AVATAR);
    setParseError(null);
  };

  const handleClear = () => {
    setJsonInput("null");
    setAvatar(null);
    setParseError(null);
  };

  return (
    <DevLayout>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Player Avatar Component
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
          Test the PlayerAvatar component with real avatar data structure from the Hattrick API.
          The avatar is composed of a background image and multiple layers positioned using x/y coordinates.
          URLs are automatically normalized to use the correct Hattrick image server.
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          {/* Preview */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Preview (92x123)
            </Typography>
            <Stack direction="row" spacing={3} alignItems="flex-start">
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 1, color: "#6b7280" }}>
                  With Avatar
                </Typography>
                <PlayerAvatar avatar={avatar} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 1, color: "#6b7280" }}>
                  Fallback (null)
                </Typography>
                <PlayerAvatar avatar={null} />
              </Box>
            </Stack>
          </Box>

          {/* JSON Editor */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                Avatar Data (JSON)
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" onClick={handleReset}>
                  Reset
                </Button>
                <Button variant="outlined" size="small" color="warning" onClick={handleClear}>
                  Set Null
                </Button>
              </Stack>
            </Stack>
            
            {parseError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {parseError}
              </Alert>
            )}

            <TextField
              multiline
              fullWidth
              minRows={16}
              maxRows={24}
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              error={!!parseError}
              sx={{
                fontFamily: "monospace",
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  fontSize: "0.85rem"
                }
              }}
            />
          </Box>
        </Stack>

        {/* Data Structure Reference */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Data Structure Reference
          </Typography>
          <Typography variant="body2" component="pre" sx={{ 
            bgcolor: "#f3f4f6", 
            p: 2, 
            borderRadius: 1, 
            fontSize: "0.8rem",
            overflow: "auto"
          }}>
{`type Avatar = {
  backgroundImage: string;  // URL or path like "/Img/Avatar/backgrounds/bg_blue.png"
  layers: AvatarLayer[];
};

type AvatarLayer = {
  image: string;  // URL or path like "/Img/Avatar/faces/f5c.png"
  x: number;      // x-coordinate for positioning
  y: number;      // y-coordinate for positioning
};`}
          </Typography>
        </Box>
      </Paper>
    </DevLayout>
  );
}
