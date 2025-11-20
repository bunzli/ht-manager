import { TableCell, Typography, Box, Tooltip, Stack, Link as MuiLink } from "@mui/material";
import type { PreparedPlayer } from "../../types/table";
import { formatValue } from "../../utils/formatting";

type PlayerNameCellProps = {
  player: PreparedPlayer;
  showWeeklyDiff: boolean;
};

export function PlayerNameCell({ player, showWeeklyDiff }: PlayerNameCellProps) {
  const displayName = formatValue("name", player.name, player, showWeeklyDiff);
  const hattrickUrl = `https://www.hattrick.org/goto.ashx?path=/Club/Players/Player.aspx?playerId=${player.playerId}`;
  const hasInjury = Number.isFinite(player.injuryDaysRemaining) && (player.injuryDaysRemaining ?? 0) > 0;

  return (
    <TableCell
      sx={{
        whiteSpace: "nowrap",
        maxWidth: 220
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
        <Typography variant="body2" sx={{ fontSize: "0.75rem", minWidth: 0, flex: 1 }} noWrap>
          <MuiLink
            href={hattrickUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            onClick={(event) => {
              event.stopPropagation();
            }}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.stopPropagation();
              }
            }}
            sx={{
              color: "#4299e1",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                color: "#63b3ed",
                textDecoration: "underline",
                textDecorationColor: "#63b3ed"
              }
            }}
          >
            {displayName}
          </MuiLink>
        </Typography>
        {hasInjury && (
          <Tooltip title={`Injury: ${player.injuryDaysRemaining} days remaining`}>
            <Box
              sx={{
                width: 34,
                height: 28,
                borderRadius: "8px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                flexShrink: 0,
                ml: 0.5,
                backdropFilter: "blur(4px)"
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#ef4444",
                  fontWeight: 700,
                  lineHeight: 1,
                  fontSize: "0.95rem"
                }}
              >
                +
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: 2,
                  left: 4,
                  fontWeight: 600,
                  fontSize: "0.65rem",
                  color: "#ef4444"
                }}
              >
                {player.injuryDaysRemaining}
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Stack>
    </TableCell>
  );
}

