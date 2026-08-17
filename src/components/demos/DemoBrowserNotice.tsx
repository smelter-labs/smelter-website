export default function DemoBrowserNotice() {
  return (
    <div className="mx-auto max-w-3xl p-4 text-center">
      <h3 className="mb-4 text-demos-header">This demo works only in Chromium-based browsers</h3>
      <p className="text-demos-subheader">
        The live WASM demos use browser features that are currently available only in Chromium-based
        browsers. Open this page in Google Chrome to try it out.
      </p>
    </div>
  );
}
