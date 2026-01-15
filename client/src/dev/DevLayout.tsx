import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

type DevLayoutProps = PropsWithChildren;

export function DevLayout({ children }: DevLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Developer Mode
          </h1>
          <div className="flex gap-4">
            <Link to="/dev/player-card" className="text-blue-600 hover:underline">
              Player Card
            </Link>
            <Link to="/dev/skill-bar" className="text-blue-600 hover:underline">
              Skill Bar
            </Link>
            <Link to="/dev/player-avatar" className="text-blue-600 hover:underline">
              Player Avatar
            </Link>
            <Link to="/" className="text-gray-500 hover:underline">
              ← Back to App
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
