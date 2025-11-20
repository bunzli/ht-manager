import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FORMATIONS, type Formation } from "../constants/formations";

type FormationSelectorProps = {
  selectedFormation: Formation | null;
  onFormationChange: (formation: Formation | null) => void;
};

export function FormationSelector({
  selectedFormation,
  onFormationChange
}: FormationSelectorProps) {
  const handleChange = (_event: unknown, value: string | null) => {
    if (value === null || value === "none") {
      onFormationChange(null);
    } else {
      const formation = FORMATIONS.find((f) => f.id === value);
      if (formation) {
        onFormationChange(formation);
      }
    }
  };

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={selectedFormation?.id ?? "none"}
      onChange={handleChange}
      sx={{
        "& .MuiToggleButton-root": {
          borderColor: "rgba(66, 153, 225, 0.2)",
          color: "#cbd5e0"
        }
      }}
    >
      <ToggleButton value="none">No Formation</ToggleButton>
      {FORMATIONS.map((formation) => (
        <ToggleButton key={formation.id} value={formation.id}>
          {formation.name}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

