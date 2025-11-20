import { MouseEvent, KeyboardEvent } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CircleIcon from "@mui/icons-material/Circle";
import { TrainingPreference, useTrainingPreferences } from "../state/useTrainingPreferences";

const LABELS: Record<TrainingPreference, string> = {
  none: "No focus",
  half: "Half focus",
  full: "Full focus"
};

const TOOLTIP: Record<TrainingPreference, string> = {
  none: "Click to set Half focus",
  half: "Click to set Full focus",
  full: "Click to clear training focus"
};

const ICONS: Record<TrainingPreference, typeof CircleIcon> = {
  none: RadioButtonUncheckedIcon,
  half: TimelapseIcon,
  full: CircleIcon
};

type TrainingPreferenceToggleProps = {
  playerId: number;
};

export function TrainingPreferenceToggle({ playerId }: TrainingPreferenceToggleProps) {
  const preference = useTrainingPreferences((state) => state.preferences[playerId] ?? "none");
  const cyclePreference = useTrainingPreferences((state) => state.cyclePreference);

  const IconComponent = ICONS[preference];

  const handleActivate = () => {
    cyclePreference(playerId);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleActivate();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      handleActivate();
    }
  };

  return (
    <Box display="flex" alignItems="center">
      <Tooltip title={TOOLTIP[preference]}>
        <IconButton
          size="small"
          aria-label={`Training preference: ${LABELS[preference]}`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          sx={{
            color: (theme) => {
              if (preference === "full") {
                return "#4299e1";
              }
              if (preference === "half") {
                return "#63b3ed";
              }
              return "rgba(203, 213, 224, 0.4)";
            },
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: "rgba(66, 153, 225, 0.1)",
              transform: "scale(1.1)"
            }
          }}
        >
          <IconComponent fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
