import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { PlayersPage } from "./features/players/PlayersPage";
import { PlayerDetailPage } from "./features/players/PlayerDetailPage";
import { ConfigPage } from "./features/config/ConfigPage";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<PlayersPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
