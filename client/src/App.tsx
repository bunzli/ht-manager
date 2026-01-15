import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { PlayersPage } from "./features/players/PlayersPage";
import { PlayerDetailPage } from "./features/players/PlayerDetailPage";
import { MatchesPage } from "./features/matches/MatchesPage";
import { DatabaseBrowserPage } from "./features/db-browser/DatabaseBrowserPage";
import { DevIndexPage } from "./dev/DevIndexPage";
import { PlayerCardDev } from "./dev/PlayerCardDev";
import { SkillBarDev } from "./dev/SkillBarDev";
import { PlayerAvatarDev } from "./dev/PlayerAvatarDev";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<PlayersPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/db-browser" element={<DatabaseBrowserPage />} />
        {import.meta.env.DEV && (
          <>
            <Route path="/dev" element={<DevIndexPage />} />
            <Route path="/dev/player-card" element={<PlayerCardDev />} />
            <Route path="/dev/skill-bar" element={<SkillBarDev />} />
            <Route path="/dev/player-avatar" element={<PlayerAvatarDev />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
