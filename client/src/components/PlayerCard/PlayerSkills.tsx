import { Box, Typography } from "@mui/material";
import { SkillBar } from "./SkillBar";

export type PlayerSkillsProps = {
  keeper: number | null | undefined;
  defending: number | null | undefined;
  playmaking: number | null | undefined;
  winger: number | null | undefined;
  passing: number | null | undefined;
  scoring: number | null | undefined;
  setPieces: number | null | undefined;
};

export function PlayerSkills({
  keeper,
  defending,
  playmaking,
  winger,
  passing,
  scoring,
  setPieces
}: PlayerSkillsProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: "#374151",
          mb: 1,
          fontSize: "0.875rem"
        }}
      >
        Skills
      </Typography>
      <Box>
        <SkillBar skillName="Keeper" level={keeper} />
        <SkillBar skillName="Defending" level={defending} />
        <SkillBar skillName="Playmaking" level={playmaking} />
        <SkillBar skillName="Winger" level={winger} />
        <SkillBar skillName="Passing" level={passing} />
        <SkillBar skillName="Scoring" level={scoring} />
        <SkillBar skillName="Set Pieces" level={setPieces} />
      </Box>
    </Box>
  );
}
