import type Smelter from "@swmansion/smelter-web-wasm";
import { create } from "zustand";
import UserSettingsTile from "./UserSettingsTile";

type UserSettingsStore = {
  usersCount: number;
  isCameraActive: boolean;
  usersMuted: Record<string, boolean>;
  setUsersCount: (counter: number) => void;
  setIsCameraActive: (cameraActive: boolean) => void;
  toggleUserMute: (userId: string) => void;
};

export const useUserSettingsStore = create<UserSettingsStore>((set) => ({
  usersCount: 1,
  isCameraActive: false,
  usersMuted: {},
  setUsersCount: (counter) => set({ usersCount: counter }),
  setIsCameraActive: (cameraActive) => set({ isCameraActive: cameraActive }),
  toggleUserMute: (userId) =>
    set((state) => ({
      usersMuted: {
        ...state.usersMuted,
        [userId]: !state.usersMuted[userId],
      },
    })),
}));

export default function UserSettingsSection({ smelter }: { smelter: Smelter }) {
  const { usersCount, isCameraActive, setUsersCount, setIsCameraActive } = useUserSettingsStore();

  const toggleCamera = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (isCameraActive) {
      await smelter?.unregisterInput("camera");
    } else {
      await smelter?.registerInput("camera", { type: "camera" });
    }
    setIsCameraActive(!isCameraActive);
  };

  const handleIncrease = () => {
    setUsersCount(usersCount + 1);
  };

  const handleDecrease = () => {
    setUsersCount(Math.max(0, usersCount - 1));
  };
  return (
    <div className="mb-4 flex h-full flex-col items-center justify-center">
      <div className="flex justify-between">
        <div className="flex mr-4">
          <label className="flex cursor-pointer select-none items-center">
            <input
              type="checkbox"
              className="hidden"
              id="toggleSwitch"
              checked={isCameraActive}
              onChange={toggleCamera}
            />
            <span className="relative">
              <span
                className={`block h-8 w-14 rounded-full bg-gray-300 shadow-inner ${isCameraActive ? "bg-switchActive" : ""}`}
              />
              <span
                className={`absolute inset-y-0 left-0 mt-1 ml-1 block h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ease-in-out focus-within:shadow-outline ${
                  isCameraActive ? "translate-x-6 transform" : ""
                }`}
              />
            </span>
            <p className="ml-2 text-demos-inputLabel">Toggle camera</p>
          </label>
        </div>
        <div className="mb-4 flex">
          <button
            type="button"
            className="rounded bg-demos-button px-4 py-2 text-demos-buttonText shadow"
            onClick={handleDecrease}>
            -
          </button>
          <div className="w-8 py-2 text-center text-white">{usersCount}</div>
          <button
            type="button"
            className="rounded bg-demos-button px-4 py-2 text-demos-buttonText shadow"
            onClick={handleIncrease}>
            +
          </button>
        </div>
      </div>

      <div className="flex h-[60vh] w-full flex-col overflow-y-auto rounded-md border border-demos-border p-2">
        <div className="h-full overflow-y-scroll">
          {Array.from({ length: usersCount }, (_, index) => index).map((number) => (
            <UserSettingsTile key={number} id={`${number}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
