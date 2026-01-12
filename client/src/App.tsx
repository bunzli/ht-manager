import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { PlayersPage } from "./features/players/PlayersPage";
import { MatchesPage } from "./features/matches/MatchesPage";
import { PlayerCardDev } from "./dev/PlayerCardDev";
import { SkillBarDev } from "./dev/SkillBarDev";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<PlayersPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        {import.meta.env.DEV && (
          <>
            <Route path="/dev/player-card" element={<PlayerCardDev />} />
            <Route path="/dev/skill-bar" element={<SkillBarDev />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
