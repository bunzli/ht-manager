import { Circle } from "lucide-react";
import type { Avatar as AvatarData } from "../../api/players";

// Avatar display dimensions
const WIDTH = 92;
const HEIGHT = 123;

// Hattrick image server base URL
const HATTRICK_IMG_BASE = "https://www85.hattrick.org";

// Normalize avatar URLs to use the correct Hattrick image server
function normalizeAvatarUrl(url: string): string {
  if (!url) return "";
  
  // If it's a relative path, prepend the Hattrick image server
  if (url.startsWith("/Img/")) {
    return `${HATTRICK_IMG_BASE}${url}`;
  }
  
  // If it uses www.hattrick.org, replace with www85.hattrick.org
  if (url.includes("www.hattrick.org")) {
    return url.replace("www.hattrick.org", "www85.hattrick.org");
  }
  
  return url;
}

export type PlayerAvatarProps = {
  avatar?: AvatarData | null;
};

function AvatarLayers({ avatar }: { avatar: AvatarData }) {
  return (
    <>
      {/* Background image - card frame, let it be natural size */}
      {avatar.backgroundImage && (
        <img
          src={normalizeAvatarUrl(avatar.backgroundImage)}
          alt=""
          className="absolute left-0 top-0"
        />
      )}
      {/* Layer images */}
      {avatar.layers.map((layer, index) => (
        <img
          key={`${layer.image}-${index}`}
          src={normalizeAvatarUrl(layer.image)}
          alt=""
          className="absolute"
          style={{
            left: layer.x,
            top: layer.y
          }}
        />
      ))}
    </>
  );
}

function FallbackAvatar() {
  return (
    <div
      className="flex items-center justify-center bg-sky-100 rounded shadow-md"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      <div className="w-1/2 aspect-square rounded-full bg-sky-500 flex items-center justify-center">
        <Circle className="size-8 text-white" />
      </div>
    </div>
  );
}

export function PlayerAvatar({ avatar }: PlayerAvatarProps) {
  const hasAvatar = avatar && avatar.layers && avatar.layers.length > 0;

  if (!hasAvatar) {
    return <FallbackAvatar />;
  }

  return (
    <div
      className="relative rounded overflow-hidden shadow-md"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      <AvatarLayers avatar={avatar} />
    </div>
  );
}
