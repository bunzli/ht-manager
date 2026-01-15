import { Box, Avatar } from "@mui/material";
import { SportsSoccer } from "@mui/icons-material";
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
        <Box
          component="img"
          src={normalizeAvatarUrl(avatar.backgroundImage)}
          alt=""
          sx={{
            position: "absolute",
            left: 0,
            top: 0
          }}
        />
      )}
      {/* Layer images */}
      {avatar.layers.map((layer, index) => (
        <Box
          key={`${layer.image}-${index}`}
          component="img"
          src={normalizeAvatarUrl(layer.image)}
          alt=""
          sx={{
            position: "absolute",
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
    <Box
      sx={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#e0f2fe",
        borderRadius: 1,
        boxShadow: "0 0 6px grey"
      }}
    >
      <Avatar
        sx={{
          width: "50%",
          height: "auto",
          aspectRatio: "1",
          bgcolor: "#0ea5e9"
        }}
      >
        <SportsSoccer sx={{ fontSize: "2rem", color: "#ffffff" }} />
      </Avatar>
    </Box>
  );
}

export function PlayerAvatar({ avatar }: PlayerAvatarProps) {
  const hasAvatar = avatar && avatar.layers && avatar.layers.length > 0;

  if (!hasAvatar) {
    return <FallbackAvatar />;
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 1,
        overflow: "hidden",
        boxShadow: "0 0 6px grey"
      }}
    >
      <AvatarLayers avatar={avatar} />
    </Box>
  );
}
