import { Link } from "react-router-dom";
import { DevLayout } from "./DevLayout";

interface DevComponent {
  name: string;
  path: string;
  description: string;
}

const DEV_COMPONENTS: DevComponent[] = [
  {
    name: "Player Card",
    path: "/dev/player-card",
    description: "Test the PlayerCard component with mock data and various player attributes"
  },
  {
    name: "Skill Bar",
    path: "/dev/skill-bar",
    description: "Test the SkillBar component with different skill levels and edge cases"
  },
  {
    name: "Player Avatar",
    path: "/dev/player-avatar",
    description: "Test the PlayerAvatar component with layered images and different sizes"
  }
];

export function DevIndexPage() {
  return (
    <DevLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dev Components
        </h2>
        <p className="text-gray-500 mb-6">
          Browse and test all available development components. These pages are only available in development mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DEV_COMPONENTS.map((component) => (
            <Link
              key={component.path}
              to={component.path}
              className="block p-4 border border-gray-200 rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {component.name}
              </h3>
              <p className="text-sm text-gray-500">
                {component.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link to="/" className="text-blue-600 hover:underline">
            ← Back to App
          </Link>
        </div>
      </div>
    </DevLayout>
  );
}
