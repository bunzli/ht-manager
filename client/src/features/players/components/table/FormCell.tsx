import { TableCell, Typography, Box } from "@mui/material";
import type { PreparedPlayer } from "../../types/table";
import { formatValue } from "../../utils/formatting";

type FormCellProps = {
  player: PreparedPlayer;
  showWeeklyDiff: boolean;
};

function getFormColor(form: number): string {
  // Specific colors for each form value
  if (form >= 8) return "#3f7137"; // dark green
  if (form === 7) return "#59965d"; // lighter green
  if (form === 6) return "#a5ad34"; // color between 7 (green) and 5 (yellow)
  if (form === 5) return "#f1c40a"; // yellow
  if (form === 4) return "#f5a104"; // orange
  return "#dd4140"; // red for form 3, 2, or 1
}

function getFormBarWidth(form: number): string {
  // Bar width: 10% for form=1, 100% for form=8
  // Linear interpolation: width = 10% + (form - 1) * (90% / 7)
  if (form <= 1) return "10%";
  if (form >= 8) return "100%";
  const widthPercent = 10 + ((form - 1) / 7) * 90;
  return `${widthPercent}%`;
}

export function FormCell({ player, showWeeklyDiff }: FormCellProps) {
  const formValue = Number(player.PlayerForm ?? 0);
  const formColor = Number.isFinite(formValue) && formValue > 0 ? getFormColor(formValue) : "#6b7280";
  const barWidth = Number.isFinite(formValue) && formValue > 0 ? getFormBarWidth(formValue) : "10%";
  const displayText = formatValue("PlayerForm", player.PlayerForm, player, showWeeklyDiff);
  
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
          bgcolor: formColor,
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

