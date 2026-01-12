import { Box, Typography, Chip } from "@mui/material";
import { getSkillLevelText, formatAge, formatWage, formatTSI } from "./utils";

export type PlayerStatsProps = {
  age: number | null | undefined;
  ageDays: number | null | undefined;
  tsi: number | null | undefined;
  salary: number | null | undefined;
  specialty: string | null | undefined;
  form: number | null | undefined;
  stamina: number | null | undefined;
};

export function PlayerStats({
  age,
  ageDays,
  tsi,
  salary,
  specialty,
  form,
  stamina
}: PlayerStatsProps) {
  const formText = getSkillLevelText(form);
  const staminaText = getSkillLevelText(stamina);

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.875rem" }}>
          Age {formatAge(age, ageDays)}
        </Typography>
      </Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.875rem" }}>
          TSI {formatTSI(tsi)}
        </Typography>
      </Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.875rem" }}>
          Wage {formatWage(salary)}
        </Typography>
      </Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.875rem" }}>
          Specialty {specialty ?? "—"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.875rem" }}>
          Form
        </Typography>
        <Chip
          label={formText}
          size="small"
          sx={{
            bgcolor: "#fef3c7",
            color: "#92400e",
            fontWeight: 500,
            height: 20,
            fontSize: "0.75rem"
          }}
        />
        <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.75rem" }}>
          {form ?? "—"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.875rem" }}>
          Stamina
        </Typography>
        <Chip
          label={staminaText}
          size="small"
          sx={{
            bgcolor: "#fef3c7",
            color: "#92400e",
            fontWeight: 500,
            height: 20,
            fontSize: "0.75rem"
          }}
        />
        <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.75rem" }}>
          {stamina ?? "—"}
        </Typography>
      </Box>
    </Box>
  );
}
