import { TableCell, Typography, Box } from "@mui/material";
import type { PreparedPlayer } from "../../types/table";
import { formatValue } from "../../utils/formatting";

type StaminaCellProps = {
  player: PreparedPlayer;
  showWeeklyDiff: boolean;
};

function getStaminaColor(stamina: number): string {
  // Specific colors for each stamina value (same as form)
  if (stamina >= 8) return "#3f7137"; // dark green
  if (stamina === 7) return "#59965d"; // lighter green
  if (stamina === 6) return "#a5ad34"; // color between 7 (green) and 5 (yellow)
  if (stamina === 5) return "#f1c40a"; // yellow
  if (stamina === 4) return "#f5a104"; // orange
  return "#dd4140"; // red for stamina 3, 2, or 1
}

function getStaminaBarWidth(stamina: number): string {
  // Bar width: 10% for stamina=1, 100% for stamina=8
  // Linear interpolation: width = 10% + (stamina - 1) * (90% / 7)
  if (stamina <= 1) return "10%";
  if (stamina >= 8) return "100%";
  const widthPercent = 10 + ((stamina - 1) / 7) * 90;
  return `${widthPercent}%`;
}

export function StaminaCell({ player, showWeeklyDiff }: StaminaCellProps) {
  const staminaValue = Number(player.StaminaSkill ?? 0);
  const staminaColor = Number.isFinite(staminaValue) && staminaValue > 0 ? getStaminaColor(staminaValue) : "#6b7280";
  const barWidth = Number.isFinite(staminaValue) && staminaValue > 0 ? getStaminaBarWidth(staminaValue) : "10%";
  const displayText = formatValue("StaminaSkill", player.StaminaSkill, player, showWeeklyDiff);
  
  return (
    <TableCell
      sx={{
        whiteSpace: "nowrap",
        position: "relative",
        padding: "8px 12px !important"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: barWidth,
          height: "4px",
          bgcolor: staminaColor,
          borderRadius: "0 0 2px 2px",
          opacity: 0.9
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.75rem",
          color: "#cbd5e0",
          fontWeight: 400,
          position: "relative",
          zIndex: 1
        }}
      >
        {displayText}
      </Typography>
    </TableCell>
  );
}

