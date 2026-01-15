import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { DevLayout } from "./DevLayout";
import { PlayerAvatar } from "../components/PlayerCard";
import { Button } from "@/components/ui/button";
import type { Avatar } from "../api/players";

// Sample avatar data based on real Hattrick API response
const SAMPLE_AVATAR: Avatar = {
  backgroundImage: "/Img/Avatar/backgrounds/card1.png",
  layers: [
    { image: "/Img/Avatar/backgrounds/bg_blue_int.png", x: 9, y: 10 },
    { image: "/Img/Avatar/bodies/bd3_s1.png", x: 9, y: 10 },
    { image: "/Img/Avatar/faces/f1a.png", x: 9, y: 10 },
    { image: "/Img/Avatar/beards/f1b2e.png", x: 9, y: 10 },
    { image: "/Img/Avatar/eyes/e12a.png", x: 23, y: 24 },
    { image: "/Img/Avatar/mouths/f1bem31c.png", x: 9, y: 10 },
    { image: "/Img/Avatar/noses/f1ben12.png", x: 9, y: 10 },
    { image: "/Img/Avatar/hair/f1h12e.png", x: 9, y: 10 },
    { image: "/Img/Avatar/misc/yellow.png", x: 9, y: 135 },
    { image: "/Img/Avatar/misc/yellow.png", x: 19, y: 135 },
    { image: "/Img/Avatar/numbers/20.png", x: 83, y: 130 }
  ]
};

export function PlayerAvatarDev() {
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(SAMPLE_AVATAR, null, 2));
  const [avatar, setAvatar] = useState<Avatar | null>(SAMPLE_AVATAR);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setAvatar(parsed);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleReset = () => {
    setJsonInput(JSON.stringify(SAMPLE_AVATAR, null, 2));
    setAvatar(SAMPLE_AVATAR);
    setParseError(null);
  };

  const handleClear = () => {
    setJsonInput("null");
    setAvatar(null);
    setParseError(null);
  };

  return (
    <DevLayout>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Player Avatar Component
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Test the PlayerAvatar component with real avatar data structure from the Hattrick API.
          The avatar is composed of a background image and multiple layers positioned using x/y coordinates.
          URLs are automatically normalized to use the correct Hattrick image server.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Preview (92x123)
            </h3>
            <div className="flex gap-6">
              <div>
                <span className="text-xs text-gray-500 block mb-2">With Avatar</span>
                <PlayerAvatar avatar={avatar} />
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-2">Fallback (null)</span>
                <PlayerAvatar avatar={null} />
              </div>
            </div>
          </div>

          {/* JSON Editor */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Avatar Data (JSON)
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Set Null
                </Button>
              </div>
            </div>
            
            {parseError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="size-4" />
                {parseError}
              </div>
            )}

            <textarea
              className="w-full h-80 p-3 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
            />
          </div>
        </div>

        {/* Data Structure Reference */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Data Structure Reference
          </h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`type Avatar = {
  backgroundImage: string;  // URL or path like "/Img/Avatar/backgrounds/bg_blue.png"
  layers: AvatarLayer[];
};

type AvatarLayer = {
  image: string;  // URL or path like "/Img/Avatar/faces/f5c.png"
  x: number;      // x-coordinate for positioning
  y: number;      // y-coordinate for positioning
};`}
          </pre>
        </div>
      </div>
    </DevLayout>
  );
}
