import { getSkillLevelColor } from "./utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type PlayerSkillsProps = {
  keeper: number | null | undefined;
  defending: number | null | undefined;
  playmaking: number | null | undefined;
  winger: number | null | undefined;
  passing: number | null | undefined;
  scoring: number | null | undefined;
  setPieces: number | null | undefined;
};

type SkillItemProps = {
  abbrev: string;
  fullName: string;
  level: number | null | undefined;
};

function SkillItem({ abbrev, fullName, level }: SkillItemProps) {
  const color = getSkillLevelColor(level);
  const levelValue = level ?? 0;
  
  // Calculate fill percentage (max 20)
  const fillPercent = Math.min(100, (levelValue / 20) * 100);
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex flex-col items-center">
            {/* Skill box */}
            <div 
              className="relative w-14 h-14 rounded bg-black/30 overflow-hidden flex items-center justify-center"
            >
              {/* Fill bar from bottom */}
              <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                style={{
                  height: `${fillPercent}%`,
                  backgroundColor: color,
                  opacity: 0.4
                }}
              />
              {/* Value */}
              <span 
                className="relative z-10 text-base font-bold"
                style={{ color }}
              >
                {level ?? "—"}
              </span>
            </div>
            {/* Label */}
            <span className="text-xs font-medium text-white/70 mt-1 uppercase">
              {abbrev}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{fullName}: {level ?? "—"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function PlayerSkills({
  keeper,
  defending,
  playmaking,
  winger,
  passing,
  scoring,
  setPieces
}: PlayerSkillsProps) {
  return (
    <div className="mt-3">
      <div className="flex justify-center gap-3 flex-wrap">
        <SkillItem abbrev="GK" fullName="Keeper" level={keeper} />
        <SkillItem abbrev="DEF" fullName="Defending" level={defending} />
        <SkillItem abbrev="PM" fullName="Playmaking" level={playmaking} />
        <SkillItem abbrev="WG" fullName="Winger" level={winger} />
        <SkillItem abbrev="PAS" fullName="Passing" level={passing} />
        <SkillItem abbrev="SC" fullName="Scoring" level={scoring} />
        <SkillItem abbrev="SP" fullName="Set Pieces" level={setPieces} />
      </div>
    </div>
  );
}
