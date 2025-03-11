import { useUserSettingsStore } from "./UsersSettingsSection";

export default function UserSettingsTile({ id }: { id: string }) {
  const { usersMuted, toggleUserMute } = useUserSettingsStore();
  const isMuted = usersMuted[id] || false;
  return (
    <div className="mb-2 h-12 w-full items-center rounded-md bg-demos-userSettingsTileBackground px-4 py-2 justify-between flex">
      <span className="text-demos-text">User {id}</span>
      <button
        type="button"
        onClick={() => toggleUserMute(id)}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        {isMuted ? "Unmute" : "Mute"}
      </button>
    </div>
  );
}
