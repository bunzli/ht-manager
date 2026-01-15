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
    <div className="space-y-1.5">
      <p className="text-sm text-gray-700">
        Age {formatAge(age, ageDays)}
      </p>
      <p className="text-sm text-gray-700">
        TSI {formatTSI(tsi)}
      </p>
      <p className="text-sm text-gray-700">
        Wage {formatWage(salary)}
      </p>
      <p className="text-sm text-gray-700">
        Specialty {specialty ?? "—"}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Form</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
          {formText}
        </span>
        <span className="text-xs text-gray-500">{form ?? "—"}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Stamina</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
          {staminaText}
        </span>
        <span className="text-xs text-gray-500">{stamina ?? "—"}</span>
      </div>
    </div>
  );
}
