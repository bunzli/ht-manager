import { getSkillLevelText, getSkillLevelColor } from "./utils";

export type SkillBarProps = {
  skillName: string;
  level: number | null | undefined;
  maxLevel?: number;
};

export function SkillBar({ skillName, level, maxLevel = 20 }: SkillBarProps) {
  const levelValue = level ?? 0;
  const levelText = getSkillLevelText(level);
  const levelColor = getSkillLevelColor(level);
  
  // Calculate bar width as percentage of max level
  const barWidth = maxLevel > 0 ? (levelValue / maxLevel) * 100 : 0;

  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="min-w-[100px] text-sm text-gray-700">
        {skillName}
      </span>
      <div className="relative flex-1 h-5 bg-gray-200 rounded overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full opacity-30 transition-[width] duration-300 ease-out"
          style={{
            width: `${barWidth}%`,
            backgroundColor: levelColor
          }}
        />
        <span
          className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium z-10"
          style={{ color: levelColor }}
        >
          {levelText}
        </span>
      </div>
      <span className="min-w-[24px] text-right text-sm font-medium text-gray-500">
        {levelValue}
      </span>
    </div>
  );
}
