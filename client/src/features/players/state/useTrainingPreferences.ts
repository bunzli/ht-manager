import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TrainingPreference = "none" | "half" | "full";

type TrainingPreferenceState = {
  preferences: Record<number, TrainingPreference>;
  setPreference: (playerId: number, preference: TrainingPreference) => void;
  cyclePreference: (playerId: number) => void;
};

const ORDER: TrainingPreference[] = ["none", "half", "full"];

function getNextPreference(current: TrainingPreference): TrainingPreference {
  const index = ORDER.indexOf(current);
  const nextIndex = index === -1 ? 1 : (index + 1) % ORDER.length;
  return ORDER[nextIndex];
}

export const useTrainingPreferences = create<TrainingPreferenceState>()(
  persist(
    (set) => ({
      preferences: {},
      setPreference: (playerId, preference) =>
        set((state) => {
          if (state.preferences[playerId] === preference) {
            return state;
          }
          return {
            preferences: {
              ...state.preferences,
              [playerId]: preference
            }
          };
        }),
      cyclePreference: (playerId) =>
        set((state) => {
          const current = state.preferences[playerId] ?? "none";
          const next = getNextPreference(current);
          if (next === current) {
            return state;
          }
          return {
            preferences: {
              ...state.preferences,
              [playerId]: next
            }
          };
        })
    }),
    {
      name: "ht-manager-training-preferences"
    }
  )
);
