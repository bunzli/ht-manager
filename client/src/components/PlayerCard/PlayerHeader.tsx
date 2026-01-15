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
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg text-emerald-600 underline">
            {name}
          </h3>
        </div>
        {countryId && (
          <div
            className="w-6 h-4 bg-gray-200 rounded-sm border border-gray-300"
            title={`Country ID: ${countryId}`}
          />
        )}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">
        Has{" "}
        <span className="text-emerald-600 font-medium">
          {experienceText} ({experience ?? "—"})
        </span>{" "}
        experience and{" "}
        <span className="text-emerald-600 font-medium">
          {leadershipText} ({leadership ?? "—"})
        </span>{" "}
        leadership. Has{" "}
        <span className="text-emerald-600 font-medium">
          {loyaltyText} ({loyalty ?? "—"})
        </span>{" "}
        loyalty.
      </p>
    </div>
  );
}
