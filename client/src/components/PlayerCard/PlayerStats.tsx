import { 
  Calendar, 
  TrendingUp, 
  Banknote, 
  Flame, 
  Zap
} from "lucide-react";
import { getFormStaminaColor, formatAge, formatWage, formatTSI } from "./utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type PlayerStatsProps = {
  age: number | null | undefined;
  ageDays: number | null | undefined;
  tsi: number | null | undefined;
  salary: number | null | undefined;
  specialty: string | number | null | undefined;
  form: number | null | undefined;
  stamina: number | null | undefined;
  experience?: number | null | undefined;
  leadership?: number | null | undefined;
  loyalty?: number | null | undefined;
};

type VerticalStatProps = {
  icon: React.ReactNode;
  value: string | number | null | undefined;
  tooltip: string;
};

function VerticalStat({ icon, value, tooltip }: VerticalStatProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white/50">{icon}</span>
            <span className="text-sm font-bold text-white">
              {value ?? "—"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type FormStaminaStatProps = {
  icon: React.ReactNode;
  value: number | null | undefined;
  tooltip: string;
  color: string;
};

function FormStaminaStat({ icon, value, tooltip, color }: FormStaminaStatProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded bg-black/20"
            style={{ borderBottom: `3px solid ${color}` }}
          >
            <span className="text-white/50">{icon}</span>
            <span 
              className="text-sm font-bold"
              style={{ color }}
            >
              {value ?? "—"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function PlayerStats({
  age,
  ageDays,
  tsi,
  salary,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  specialty: _specialty,
  form,
  stamina,
  experience,
  leadership,
  loyalty
}: PlayerStatsProps) {
  const formColor = getFormStaminaColor(form);
  const staminaColor = getFormStaminaColor(stamina);

  // Format age as compact (years.fraction)
  const ageCompact = age !== null && age !== undefined
    ? `${age}.${Math.floor((ageDays ?? 0) / 11.2)}`
    : "—";

  // Format TSI as compact (K for thousands, M for millions)
  const tsiCompact = tsi !== null && tsi !== undefined
    ? tsi >= 1000000
      ? `${(tsi / 1000000).toFixed(1)}M`
      : tsi >= 1000
        ? `${(tsi / 1000).toFixed(0)}K`
        : String(tsi)
    : "—";

  // Format salary as compact
  const salaryCompact = salary !== null && salary !== undefined
    ? `${((salary * 20) / 1000).toFixed(0)}K`
    : "—";

  return (
    <div className="space-y-2">
      {/* Main stats row - vertical style like FIFA sticker */}
      <div className="flex justify-center items-end gap-4">
        <VerticalStat 
          icon={<Calendar className="size-4" />} 
          value={ageCompact}
          tooltip={formatAge(age, ageDays)}
        />
        <VerticalStat 
          icon={<TrendingUp className="size-4" />} 
          value={tsiCompact}
          tooltip={`TSI: ${formatTSI(tsi)}`}
        />
        <VerticalStat 
          icon={<Banknote className="size-4" />} 
          value={salaryCompact}
          tooltip={`Salary: ${formatWage(salary)}`}
        />
        
        {/* Form and Stamina with color indicators */}
        <FormStaminaStat 
          icon={<Flame className="size-4" />} 
          value={form}
          tooltip={`Form: ${form ?? "—"}`}
          color={formColor}
        />
        <FormStaminaStat 
          icon={<Zap className="size-4" />} 
          value={stamina}
          tooltip={`Stamina: ${stamina ?? "—"}`}
          color={staminaColor}
        />
      </div>

      {/* Secondary stats as simple text at bottom */}
      <div className="flex justify-center gap-3 text-[10px] text-white/50">
        <span>EXP: {experience ?? "—"}</span>
        <span>•</span>
        <span>LDR: {leadership ?? "—"}</span>
        <span>•</span>
        <span>LOY: {loyalty ?? "—"}</span>
      </div>
    </div>
  );
}
