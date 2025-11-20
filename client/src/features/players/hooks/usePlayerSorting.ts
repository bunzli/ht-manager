import { useMemo, useState } from "react";
import type { PreparedPlayer, OrderDirection } from "../types/table";
import type { BestPosition } from "../utils/positionScores";
import { POSITION_ORDER } from "../utils/positionScores";
import { getFieldValue, compareValues } from "../utils/playerPreparation";

export function usePlayerSorting(
  preparedPlayers: PreparedPlayer[],
  evaluationPosition: BestPosition | null,
  defaultOrderBy: string
) {
  const [orderBy, setOrderBy] = useState<string>(defaultOrderBy);
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("asc");

  const handleSort = (fieldId: string) => {
    if (orderBy === fieldId) {
      setOrderDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(fieldId);
      setOrderDirection("asc");
    }
  };

  const sortedPlayers = useMemo(() => {
    const rows = [...preparedPlayers];
    if (evaluationPosition) {
      rows.sort((rowA, rowB) => {
        const scoreA = rowA.positionScores[evaluationPosition] ?? -Infinity;
        const scoreB = rowB.positionScores[evaluationPosition] ?? -Infinity;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return rowA.name.localeCompare(rowB.name);
      });
      return rows;
    }

    if (orderBy === "bestPosition") {
      rows.sort((rowA, rowB) => {
        const indexA =
          rowA.bestPosition !== null
            ? POSITION_ORDER.indexOf(rowA.bestPosition)
            : -1;
        const indexB =
          rowB.bestPosition !== null
            ? POSITION_ORDER.indexOf(rowB.bestPosition)
            : -1;
        const safeIndexA = indexA === -1 ? POSITION_ORDER.length : indexA;
        const safeIndexB = indexB === -1 ? POSITION_ORDER.length : indexB;
        const factor = orderDirection === "asc" ? 1 : -1;

        if (safeIndexA !== safeIndexB) {
          return (safeIndexA - safeIndexB) * factor;
        }

        const scoreA = rowA.bestPositionScore ?? -Infinity;
        const scoreB = rowB.bestPositionScore ?? -Infinity;
        if (scoreA !== scoreB) {
          return orderDirection === "asc" ? scoreB - scoreA : scoreA - scoreB;
        }

        return rowA.name.localeCompare(rowB.name);
      });
      return rows;
    }

    return rows.sort((a, b) => {
      const valueA = getFieldValue(a, orderBy);
      const valueB = getFieldValue(b, orderBy);
      return compareValues(valueA, valueB, orderDirection);
    });
  }, [preparedPlayers, orderBy, orderDirection, evaluationPosition]);

  return {
    orderBy,
    orderDirection,
    handleSort,
    sortedPlayers
  };
}

