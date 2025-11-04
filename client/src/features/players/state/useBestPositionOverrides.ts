import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BestPosition } from "../utils/positionScores";

type BestPositionOverrideState = {
  overrides: Record<number, BestPosition>;
  setOverride: (playerId: number, position: BestPosition | null) => void;
};

export const useBestPositionOverrides = create<BestPositionOverrideState>()(
  persist(
    (set) => ({
      overrides: {},
      setOverride: (playerId, position) =>
        set((state) => {
          if (!position) {
            const { [playerId]: _removed, ...rest } = state.overrides;
            return { overrides: rest };
          }
          return {
            overrides: {
              ...state.overrides,
              [playerId]: position
            }
          };
        })
    }),
    {
      name: "ht-manager-best-position-overrides"
    }
  )
);
