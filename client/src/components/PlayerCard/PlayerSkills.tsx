import { SkillBar } from "./SkillBar";

export type PlayerSkillsProps = {
  keeper: number | null | undefined;
  defending: number | null | undefined;
  playmaking: number | null | undefined;
  winger: number | null | undefined;
  passing: number | null | undefined;
  scoring: number | null | undefined;
  setPieces: number | null | undefined;
};

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
    <div className="mt-4">
      <h4 className="font-semibold text-sm text-gray-700 mb-2">
        Skills
      </h4>
      <div>
        <SkillBar skillName="Keeper" level={keeper} />
        <SkillBar skillName="Defending" level={defending} />
        <SkillBar skillName="Playmaking" level={playmaking} />
        <SkillBar skillName="Winger" level={winger} />
        <SkillBar skillName="Passing" level={passing} />
        <SkillBar skillName="Scoring" level={scoring} />
        <SkillBar skillName="Set Pieces" level={setPieces} />
      </div>
    </div>
  );
}
