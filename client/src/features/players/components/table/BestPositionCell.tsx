import { useState } from "react";
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  TableCell,
  Box,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CheckIcon from "@mui/icons-material/Check";
import type { BestPositionCellProps } from "../../types/table";
import type { BestPosition } from "../../utils/positionScores";
import { POSITION_ORDER, getPositionLabel, getPositionDisplayInfo } from "../../utils/positionScores";
import { formatScore } from "../../utils/formatting";

export function BestPositionCell({ player, onOverrideChange }: BestPositionCellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const display = getPositionDisplayInfo(player.bestPosition);

  const handleOpen = (event: ReactMouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (position: BestPosition | null) => {
    onOverrideChange(player.playerId, position);
    handleClose();
  };

  const chipLabel = display?.label ?? "Set";

  return (
    <TableCell
      sx={{
        whiteSpace: "nowrap",
        width: 120,
        textAlign: "center"
      }}
    >
      <Tooltip
        title={
          player.bestPosition
            ? `${getPositionLabel(player.bestPosition)}${
                player.bestPositionIsOverridden ? " (overridden)" : ""
              }`
            : "No position data"
        }
      >
        <Box
          onClick={handleOpen}
          onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              setAnchorEl(event.currentTarget);
            }
          }}
          role="button"
          tabIndex={0}
          sx={{
            position: "relative",
            display: "inline-flex"
          }}
        >
          <Chip
            label={chipLabel}
            size="small"
            variant={display ? "filled" : "outlined"}
            sx={{
              bgcolor: display ? display.color : "rgba(66, 153, 225, 0.1)",
              color: display
                ? "#ffffff"
                : "#4299e1",
              borderColor: display ? "transparent" : "rgba(66, 153, 225, 0.3)",
              fontWeight: 600,
              fontSize: "0.7rem",
              px: 1,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: display ? display.color : "rgba(66, 153, 225, 0.2)",
                transform: "scale(1.05)",
                boxShadow: display
                  ? `0 0 12px ${display.color}40`
                  : "0 0 8px rgba(66, 153, 225, 0.3)"
              }
            }}
          />
          {player.bestPositionIsOverridden && (
            <StarIcon
              fontSize="inherit"
              sx={{
                position: "absolute",
                top: -6,
                right: -6,
                fontSize: "0.85rem",
                color: "#4299e1",
                filter: "drop-shadow(0 0 4px rgba(66, 153, 225, 0.6))"
              }}
            />
          )}
        </Box>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(event: ReactMouseEvent<HTMLElement>) => event.stopPropagation()}
        PaperProps={{
          sx: {
            bgcolor: "#0f1428",
            border: "1px solid rgba(66, 153, 225, 0.2)",
            borderRadius: 2,
            mt: 1,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            "& .MuiMenuItem-root": {
              color: "#cbd5e0",
              "&:hover": {
                bgcolor: "rgba(66, 153, 225, 0.1)"
              },
              "&.Mui-selected": {
                bgcolor: "rgba(66, 153, 225, 0.2)",
                color: "#4299e1"
              }
            }
          }
        }}
      >
        <MenuItem onClick={() => handleSelect(null)}>
          <ListItemIcon>
            {!player.bestPositionIsOverridden ? <CheckIcon fontSize="small" /> : null}
          </ListItemIcon>
          <ListItemText
            primary="Auto (calculated)"
            secondary={
              player.computedBestPosition
                ? `${getPositionLabel(player.computedBestPosition)} · ${formatScore(
                    player.computedBestScore
                  )}`
                : "No data"
            }
          />
        </MenuItem>
        {POSITION_ORDER.map((position) => {
          const isSelected = player.bestPositionIsOverridden && player.bestPosition === position;
          const score = player.positionScores[position] ?? null;
          return (
            <MenuItem key={position} onClick={() => handleSelect(position)}>
              <ListItemIcon>{isSelected ? <CheckIcon fontSize="small" /> : null}</ListItemIcon>
              <ListItemText
                primary={getPositionLabel(position)}
                secondary={`Score: ${formatScore(score)}`}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </TableCell>
  );
}

