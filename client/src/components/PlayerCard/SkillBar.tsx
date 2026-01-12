import { Box, Typography } from "@mui/material";
import { getSkillLevelText, getSkillLevelColor } from "./utils";

export type SkillBarProps = {
  skillName: string;
  level: number | null | undefined;
  maxLevel?: number;
};

export function SkillBar({ skillName, level, maxLevel = 20 }: SkillBarProps) {
  const levelValue = level ?? 0;
  const levelText = getSkillLevelText(level);
  const levelColor = getSkillLevelColor(level);
  
  // Calculate bar width as percentage of max level
  const barWidth = maxLevel > 0 ? (levelValue / maxLevel) * 100 : 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 0.5
      }}
    >
      <Typography
        variant="body2"
        sx={{
          minWidth: 100,
          fontSize: "0.875rem",
          color: "#374151"
        }}
      >
        {skillName}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: 20,
          bgcolor: "#e5e7eb",
          borderRadius: 1,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${barWidth}%`,
            bgcolor: levelColor,
            opacity: 0.3,
            transition: "width 0.3s ease"
          }}
        />
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: levelColor,
            zIndex: 1
          }}
        >
          {levelText}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          minWidth: 24,
          textAlign: "right",
          fontSize: "0.875rem",
          color: "#6b7280",
          fontWeight: 500
        }}
      >
        {levelValue}
      </Typography>
    </Box>
  );
}
