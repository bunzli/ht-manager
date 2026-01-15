import { useState } from "react";
import { DevLayout } from "./DevLayout";
import { SkillBar } from "../components/PlayerCard";
import { Input } from "@/components/ui/input";

export function SkillBarDev() {
  const [keeperLevel, setKeeperLevel] = useState<number>(5);
  const [defendingLevel, setDefendingLevel] = useState<number>(8);
  const [playmakingLevel, setPlaymakingLevel] = useState<number>(12);
  const [wingerLevel, setWingerLevel] = useState<number>(3);
  const [passingLevel, setPassingLevel] = useState<number>(6);
  const [scoringLevel, setScoringLevel] = useState<number>(10);
  const [setPiecesLevel, setSetPiecesLevel] = useState<number>(1);

  return (
    <DevLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Skill Bar Component
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          This page allows you to test the SkillBar component with different skill levels.
        </p>
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="w-24">
              <label className="text-xs text-gray-500">Keeper</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={keeperLevel}
                onChange={(e) => setKeeperLevel(Number(e.target.value))}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500">Defending</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={defendingLevel}
                onChange={(e) => setDefendingLevel(Number(e.target.value))}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500">Playmaking</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={playmakingLevel}
                onChange={(e) => setPlaymakingLevel(Number(e.target.value))}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500">Winger</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={wingerLevel}
                onChange={(e) => setWingerLevel(Number(e.target.value))}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500">Passing</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={passingLevel}
                onChange={(e) => setPassingLevel(Number(e.target.value))}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500">Scoring</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={scoringLevel}
                onChange={(e) => setScoringLevel(Number(e.target.value))}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500">Set Pieces</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={setPiecesLevel}
                onChange={(e) => setSetPiecesLevel(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <SkillBar skillName="Keeper" level={keeperLevel} />
            <SkillBar skillName="Defending" level={defendingLevel} />
            <SkillBar skillName="Playmaking" level={playmakingLevel} />
            <SkillBar skillName="Winger" level={wingerLevel} />
            <SkillBar skillName="Passing" level={passingLevel} />
            <SkillBar skillName="Scoring" level={scoringLevel} />
            <SkillBar skillName="Set Pieces" level={setPiecesLevel} />
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Edge Cases
          </h3>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <SkillBar skillName="Null Value" level={null} />
            <SkillBar skillName="Undefined Value" level={undefined} />
            <SkillBar skillName="Low Level" level={1} />
            <SkillBar skillName="High Level" level={20} />
          </div>
        </div>
      </div>
    </DevLayout>
  );
}
