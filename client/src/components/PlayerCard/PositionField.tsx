import type { BestPosition } from "../../features/players/utils/positionScores";
import { getPositionColor } from "../../features/players/utils/positionScores";

export type PositionFieldProps = {
  position: BestPosition | null | undefined;
};

// Position coordinates on the field (relative percentages)
const POSITION_COORDS: Record<BestPosition, { x: number; y: number }> = {
  GK: { x: 50, y: 90 },   // Goalkeeper at bottom center
  CD: { x: 50, y: 70 },   // Central defender
  WB: { x: 25, y: 60 },   // Wing back (shown on left, represents both sides)
  IM: { x: 50, y: 45 },   // Inner midfielder
  WNG: { x: 25, y: 30 },  // Winger (shown on left, represents both sides)
  FW: { x: 50, y: 15 },   // Forward at top center
};

export function PositionField({ position }: PositionFieldProps) {
  const positionColor = position ? getPositionColor(position) : "#666";
  const coords = position ? POSITION_COORDS[position] : null;

  return (
    <div className="relative w-[70px] h-[90px]">
      {/* Field icon as background */}
      <img 
        src="https://cdn-icons-png.flaticon.com/512/157/157541.png" 
        alt="Soccer field"
        className="w-full h-full opacity-40"
        style={{ filter: "brightness(0) invert(1)" }}
      />
      
      {/* Position marker */}
      {coords && (
        <>
          {/* Main position dot */}
          <div 
            className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
            style={{ 
              left: `${coords.x}%`, 
              top: `${coords.y}%`,
              backgroundColor: positionColor,
              boxShadow: `0 0 8px ${positionColor}, 0 0 16px ${positionColor}`
            }}
          />
          
          {/* Mirror position for WB and WNG (show on both sides) */}
          {(position === "WB" || position === "WNG") && (
            <div 
              className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
              style={{ 
                left: `${100 - coords.x}%`, 
                top: `${coords.y}%`,
                backgroundColor: positionColor,
                boxShadow: `0 0 8px ${positionColor}, 0 0 16px ${positionColor}`
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
