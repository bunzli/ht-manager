import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Stack, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { DevLayout } from "./DevLayout";
import { PlayerCard } from "../components/PlayerCard";
import type { Player } from "../api/players";

// Mock avatar data based on real Hattrick API response (uses relative paths)
const MOCK_AVATAR = {
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

// Mock player data for development
function createMockPlayer(overrides?: Partial<Player>): Player {
  const basePlayer: Player = {
    playerId: 12345,
    teamId: 123,
    name: "Pedro Moxo",
    active: true,
    recentChanges: [],
    latestSnapshot: {
      snapshotId: 1,
      fetchedAt: new Date().toISOString(),
      data: {
        Age: 17,
        AgeDays: 59,
        TSI: 430,
        Salary: 2900,
        Specialty: "-",
        PlayerForm: 6,
        StaminaSkill: 5,
        Experience: 2,
        Leadership: 4,
        Loyalty: 20,
        CountryID: 1,
        PlayerNumber: 10,
        KeeperSkill: 2,
        DefenderSkill: 3,
        PlaymakerSkill: 5,
        WingerSkill: 6,
        PassingSkill: 3,
        ScorerSkill: 4,
        SetPiecesSkill: 1,
        LastMatch: {
          Rating: 2.5,
          Date: "2025-12-31",
          Position: "Wing Back"
        },
        Avatar: MOCK_AVATAR
      }
    }
  };

  return { ...basePlayer, ...overrides };
}

const SPECIALTIES = [
  "-",
  "Technical",
  "Quick",
  "Powerful",
  "Head",
  "Unpredictable",
  "Resilient",
  "Support"
];

export function PlayerCardDev() {
  const [mockPlayer, setMockPlayer] = useState<Player>(createMockPlayer());

  const handleUpdateField = (field: string, value: string) => {
    const numValue = Number(value);
    const newData = {
      ...mockPlayer.latestSnapshot!.data,
      [field]: isNaN(numValue) ? value : numValue
    };
    setMockPlayer({
      ...mockPlayer,
      latestSnapshot: {
        ...mockPlayer.latestSnapshot!,
        data: newData
      }
    });
  };

  return (
    <DevLayout>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Player Card Component
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
          This page allows you to test the PlayerCard component in isolation with mock data.
        </Typography>
        <Box sx={{ mb: 3 }}>
          <PlayerCard player={mockPlayer} />
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Test Different Values
          </Typography>
          <Stack spacing={2} direction="row" flexWrap="wrap">
            <TextField
              label="Name"
              size="small"
              value={mockPlayer.name}
              onChange={(e) => setMockPlayer({ ...mockPlayer, name: e.target.value })}
            />
            <TextField
              label="Age"
              size="small"
              type="number"
              value={(mockPlayer.latestSnapshot?.data as Record<string, unknown>)?.Age ?? ""}
              onChange={(e) => handleUpdateField("Age", e.target.value)}
            />
            <TextField
              label="Form"
              size="small"
              type="number"
              value={(mockPlayer.latestSnapshot?.data as Record<string, unknown>)?.PlayerForm ?? ""}
              onChange={(e) => handleUpdateField("PlayerForm", e.target.value)}
            />
            <TextField
              label="Keeper Skill"
              size="small"
              type="number"
              value={(mockPlayer.latestSnapshot?.data as Record<string, unknown>)?.KeeperSkill ?? ""}
              onChange={(e) => handleUpdateField("KeeperSkill", e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={(mockPlayer.latestSnapshot?.data as Record<string, unknown>)?.Specialty ?? "-"}
                label="Specialty"
                onChange={(e) => handleUpdateField("Specialty", e.target.value)}
              >
                {SPECIALTIES.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty === "-" ? "None" : specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Paper>
    </DevLayout>
  );
}
