import { TableCell, Box } from "@mui/material";
import type { PreparedPlayer } from "../../types/table";

type ActivityIndicatorCellProps = {
  player: PreparedPlayer;
};

export function ActivityIndicatorCell({ player }: ActivityIndicatorCellProps) {
  return (
    <TableCell
      padding="none"
      sx={{
        width: 12,
        borderBottom: "inherit",
        px: 0,
        position: "relative"
      }}
    >
      <Box
        component="span"
        sx={{
          display: "block",
          width: 4,
          height: "100%",
          minHeight: 32,
          borderRadius: 2,
          mx: "auto",
          bgcolor: player.hasPlayedThisPeriod ? "#4299e1" : "rgba(66, 153, 225, 0.2)",
          boxShadow: player.hasPlayedThisPeriod
            ? "0 0 8px rgba(66, 153, 225, 0.5)"
            : "none",
          transition: "all 0.2s ease-in-out"
        }}
      />
    </TableCell>
  );
}

