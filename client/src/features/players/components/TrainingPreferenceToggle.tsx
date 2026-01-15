import { MouseEvent, KeyboardEvent } from "react";
import { Circle, CircleDot, CircleDashed } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
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

const ICONS: Record<TrainingPreference, typeof Circle> = {
  none: CircleDashed,
  half: CircleDot,
  full: Circle
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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={`Training preference: ${LABELS[preference]}`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            "p-1.5 rounded-md transition-all duration-200 hover:bg-primary/10 hover:scale-110",
            preference === "full" && "text-primary",
            preference === "half" && "text-primary-light",
            preference === "none" && "text-muted/40"
          )}
        >
          <IconComponent className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{TOOLTIP[preference]}</TooltipContent>
    </Tooltip>
  );
}
