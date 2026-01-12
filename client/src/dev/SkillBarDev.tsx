import { useState } from "react";
import { Box, Paper, Typography, TextField, Stack } from "@mui/material";
import { DevLayout } from "./DevLayout";
import { SkillBar } from "../components/PlayerCard";

export function SkillBarDev() {
  const [keeperLevel, setKeeperLevel] = useState<number>(5);
  const [defendingLevel, setDefendingLevel] = useState<number>(8);
  const [playmakingLevel, setPlaymakingLevel] = useState<number>(12);
  const [wingerLevel, setWingerLevel] = useState<number>(3);
  const [passingLevel, setPassingLevel] = useState<number>(6);
  const [scoringLevel, setScoringLevel] = useState<number>(10);
  const [setPiecesLevel, setSetPiecesLevel] = useState<number>(1);

  return (
    <DevLayout>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Skill Bar Component
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
          This page allows you to test the SkillBar component with different skill levels.
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Stack spacing={2} direction="row" flexWrap="wrap" sx={{ mb: 3 }}>
            <TextField
              label="Keeper"
              type="number"
              size="small"
              value={keeperLevel}
              onChange={(e) => setKeeperLevel(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              label="Defending"
              type="number"
              size="small"
              value={defendingLevel}
              onChange={(e) => setDefendingLevel(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              label="Playmaking"
              type="number"
              size="small"
              value={playmakingLevel}
              onChange={(e) => setPlaymakingLevel(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              label="Winger"
              type="number"
              size="small"
              value={wingerLevel}
              onChange={(e) => setWingerLevel(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              label="Passing"
              type="number"
              size="small"
              value={passingLevel}
              onChange={(e) => setPassingLevel(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              label="Scoring"
              type="number"
              size="small"
              value={scoringLevel}
              onChange={(e) => setScoringLevel(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              label="Set Pieces"
              type="number"
              size="small"
              value={setPiecesLevel}
              onChange={(e) => setSetPiecesLevel(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
            />
          </Stack>
          <Box sx={{ bgcolor: "#ffffff", p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
            <SkillBar skillName="Keeper" level={keeperLevel} />
            <SkillBar skillName="Defending" level={defendingLevel} />
            <SkillBar skillName="Playmaking" level={playmakingLevel} />
            <SkillBar skillName="Winger" level={wingerLevel} />
            <SkillBar skillName="Passing" level={passingLevel} />
            <SkillBar skillName="Scoring" level={scoringLevel} />
            <SkillBar skillName="Set Pieces" level={setPiecesLevel} />
          </Box>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Edge Cases
          </Typography>
          <Box sx={{ bgcolor: "#ffffff", p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
            <SkillBar skillName="Null Value" level={null} />
            <SkillBar skillName="Undefined Value" level={undefined} />
            <SkillBar skillName="Low Level" level={1} />
            <SkillBar skillName="High Level" level={20} />
          </Box>
        </Box>
      </Paper>
    </DevLayout>
  );
}
