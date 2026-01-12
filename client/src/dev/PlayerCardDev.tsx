import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Stack } from "@mui/material";
import { DevLayout } from "./DevLayout";
import { PlayerCard } from "../components/PlayerCard";
import type { Player } from "../api/players";

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
        }
      }
    }
  };

  return { ...basePlayer, ...overrides };
}

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
          </Stack>
        </Box>
      </Paper>
    </DevLayout>
  );
}
