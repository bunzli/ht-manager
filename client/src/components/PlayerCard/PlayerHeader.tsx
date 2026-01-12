import { Box, Typography, Chip } from "@mui/material";
import { Favorite } from "@mui/icons-material";
import { getSkillLevelText } from "./utils";

export type PlayerHeaderProps = {
  name: string;
  experience: number | null | undefined;
  leadership: number | null | undefined;
  loyalty: number | null | undefined;
  countryId?: number | null;
};

export function PlayerHeader({
  name,
  experience,
  leadership,
  loyalty,
  countryId
}: PlayerHeaderProps) {
  const experienceText = getSkillLevelText(experience);
  const leadershipText = getSkillLevelText(leadership);
  const loyaltyText = getSkillLevelText(loyalty);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#059669",
              textDecoration: "underline",
              fontSize: "1.125rem"
            }}
          >
            {name}
          </Typography>
          <Favorite sx={{ fontSize: 16, color: "#ef4444" }} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
          {countryId && (
            <Box
              sx={{
                width: 24,
                height: 16,
                bgcolor: "#e5e7eb",
                borderRadius: 0.5,
                border: "1px solid #d1d5db"
              }}
              title={`Country ID: ${countryId}`}
            />
          )}
        </Box>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: "#374151",
          fontSize: "0.875rem",
          lineHeight: 1.5
        }}
      >
        Has{" "}
        <Box component="span" sx={{ color: "#059669", fontWeight: 500 }}>
          {experienceText} ({experience ?? "—"})
        </Box>{" "}
        experience and{" "}
        <Box component="span" sx={{ color: "#059669", fontWeight: 500 }}>
          {leadershipText} ({leadership ?? "—"})
        </Box>{" "}
        leadership. Has{" "}
        <Box component="span" sx={{ color: "#059669", fontWeight: 500 }}>
          {loyaltyText} ({loyalty ?? "—"})
        </Box>{" "}
        loyalty.
      </Typography>
    </Box>
  );
}
