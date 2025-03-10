import { navigate } from "astro:transitions/client";
import { type FormEvent, useRef } from "react";
import { useStreamStore } from "../streaming-app/LayoutsSection";

export default function SetupForm() {
  const { twitchKey, setTwitchKey } = useStreamStore();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (formData.getAll("key")[0]) {
      setTwitchKey(formData.getAll("key")[0].toString());
    }
    navigate('/demos/streaming-app')
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col space-y-4 py-4">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 py-4">
          <label htmlFor="key">
            <input
              ref={inputRef}
              type="text"
              id="key"
              name="key"
              placeholder="Enter a twitch key"
              className="w-[60%] rounded-md border bg-demos-background p-4 text-demos-inputLabel shadow-sm focus:outline-none"
            />
          </label>
          <button type="submit" className="gradient-red-5 h-12 w-fit rounded-full px-6 sm:px-7">
            <div className="flex items-center justify-center gap-x-3 text-white text-xl">
              <span>Continue</span>
            </div>
          </button>
        </form>
        <p className="text-demos-subheader">
          If you don't provide a key, the example will only be displayed on the site.
        </p>
      </div>
    </div>
  );
}
