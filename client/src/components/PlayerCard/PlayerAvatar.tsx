import { Box, Avatar } from "@mui/material";
import { SportsSoccer } from "@mui/icons-material";

export type PlayerAvatarProps = {
  playerNumber?: number | null;
};

export function PlayerAvatar({ playerNumber }: PlayerAvatarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 120,
        height: 120,
        bgcolor: "#e0f2fe",
        borderRadius: 2,
        border: "2px solid #bae6fd"
      }}
    >
      <Avatar
        sx={{
          width: 100,
          height: 100,
          bgcolor: "#0ea5e9"
        }}
      >
        <SportsSoccer sx={{ fontSize: 48, color: "#ffffff" }} />
      </Avatar>
      {playerNumber && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "#fbbf24",
            color: "#ffffff",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 600
          }}
        >
          {playerNumber}
        </Box>
      )}
    </Box>
  );
}
