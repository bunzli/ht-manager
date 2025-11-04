import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type FieldConfig = {
  id: string;
  label: string;
  visible: boolean;
  order: number;
};

type TableConfigState = {
  fields: FieldConfig[];
  setFields: (fields: FieldConfig[]) => void;
  updateField: (id: string, values: Partial<Omit<FieldConfig, "id">>) => void;
};

const BASE_FIELDS: FieldConfig[] = [
  { id: "name", label: "Name", visible: true, order: 0 },
  { id: "playerId", label: "Player ID", visible: true, order: 1 },
  { id: "teamId", label: "Team ID", visible: false, order: 2 },
  { id: "active", label: "Active", visible: true, order: 3 },
  { id: "latestSnapshotFetchedAt", label: "Last Sync", visible: true, order: 4 },
  { id: "trainingPreference", label: "Training", visible: true, order: 5 },
  { id: "injuryDaysRemaining", label: "Injury Days", visible: false, order: 6 },
  { id: "bestPosition", label: "Best Position", visible: true, order: 7 },
  { id: "bestPositionScore", label: "Best Position Score", visible: true, order: 8 },
  { id: "recentChangesCount", label: "Recent Changes", visible: true, order: 9 }
];

const SNAPSHOT_FIELD_LABELS: Record<string, string> = {
  PlayerNumber: "Number",
  Age: "Age",
  AgeDays: "Age (Days)",
  ArrivalDate: "Arrival",
  TSI: "TSI",
  PlayerForm: "Form",
  Experience: "Experience",
  Loyalty: "Loyalty",
  Leadership: "Leadership",
  Salary: "Salary",
  MatchesCurrentTeam: "Matches (Team)",
  GoalsCurrentTeam: "Goals (Team)",
  AssistsCurrentTeam: "Assists (Team)",
  CareerGoals: "Career Goals",
  CareerAssists: "Career Assists",
  Specialty: "Specialty",
  TransferListed: "Transfer Listed",
  NationalTeamID: "National Team ID",
  CountryID: "Country ID",
  Caps: "Caps",
  CapsU20: "Caps U20",
  Cards: "Cards",
  InjuryLevel: "Injury Level",
  StaminaSkill: "Stamina",
  KeeperSkill: "Keeper",
  PlaymakerSkill: "Playmaker",
  ScorerSkill: "Scorer",
  PassingSkill: "Passing",
  WingerSkill: "Winger",
  DefenderSkill: "Defender",
  SetPiecesSkill: "Set Pieces"
};

const SNAPSHOT_FIELDS: FieldConfig[] = Object.keys(SNAPSHOT_FIELD_LABELS).map(
  (id, index) => ({
    id,
    label: SNAPSHOT_FIELD_LABELS[id] ?? id,
    visible: false,
    order: BASE_FIELDS.length + index
  })
);

export const DEFAULT_FIELDS: FieldConfig[] = [...BASE_FIELDS, ...SNAPSHOT_FIELDS];

export const useTableConfig = create<TableConfigState>()(
  devtools(
    persist(
      (set) => ({
        fields: DEFAULT_FIELDS,
        setFields: (fields) => set({ fields }),
        updateField: (id, values) =>
          set((state) => ({
            fields: state.fields.map((field) =>
              field.id === id ? { ...field, ...values } : field
            )
          }))
      }),
      {
        name: "ht-manager-table-config",
        version: 5,
        migrate: (persistedState: unknown, version) => {
          const state = persistedState as TableConfigState | undefined;

          if (!state) {
            return {
              fields: DEFAULT_FIELDS
            };
          }

          let fields = state.fields ?? [];
          if (!Array.isArray(fields) || fields.length === 0) {
            fields = DEFAULT_FIELDS;
          }

          if (version === undefined || version < 1) {
            fields = fields.map((field) =>
              field.id === "latestSnapshot.fetchedAt"
                ? { ...field, id: "latestSnapshotFetchedAt" }
                : field
            );
          }

          if (version === undefined || version < 2) {
            const existingIds = new Set(fields.map((field) => field.id));
            for (const defaultField of DEFAULT_FIELDS) {
              if (!existingIds.has(defaultField.id)) {
                fields.push(defaultField);
                existingIds.add(defaultField.id);
              }
            }
            fields.sort((a, b) => a.order - b.order);
          }

          if (version === undefined || version < 3) {
            const existingIds = new Set(fields.map((field) => field.id));
            for (const defaultField of DEFAULT_FIELDS) {
              if (!existingIds.has(defaultField.id)) {
                fields.push(defaultField);
                existingIds.add(defaultField.id);
              }
            }
            fields.sort((a, b) => a.order - b.order);
          }

          if (version === undefined || version < 4) {
            const existingIds = new Set(fields.map((field) => field.id));
            for (const defaultField of DEFAULT_FIELDS) {
              if (!existingIds.has(defaultField.id)) {
                fields.push(defaultField);
                existingIds.add(defaultField.id);
              }
            }
            fields.sort((a, b) => a.order - b.order);
          }

          if (version === undefined || version < 5) {
            const existingIds = new Set(fields.map((field) => field.id));
            for (const defaultField of DEFAULT_FIELDS) {
              if (!existingIds.has(defaultField.id)) {
                fields.push(defaultField);
                existingIds.add(defaultField.id);
              }
            }
            fields.sort((a, b) => a.order - b.order);
          }

          return {
            ...state,
            fields
          };
        }
      }
    )
  )
);

export function sortedVisibleFields(fields: FieldConfig[]): FieldConfig[] {
  return [...fields]
    .filter((field) => field.visible)
    .sort((a, b) => a.order - b.order);
}
