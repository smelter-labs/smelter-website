// Define a store type for better TypeScript support
// type FileStore = {
//   fileBlobUrl: string;
//   setFileBlobUrl: (url: string) => void;
// };

// Create the store
// const useLocalFileStore = create<FileStore>((set) => ({
//   fileBlobUrl: "",
//   setFileBlobUrl: (url: string) => set({ fileBlobUrl: url }),
// }));

export default function LocalFile() {
  // const { fileBlobUrl, setFileBlobUrl } = useLocalFileStore();
  // const smelterRef = useRef<Smelter | null>(null);

  // const onCanvasCreate = useCallback(async (smelter: Smelter) => {
  //   smelterRef.current = smelter;
  //   // await smelter.registerInput("camera", { type: "camera" });
  // }, []);

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];

  //   if (file) {
  //     const blobUrl = URL.createObjectURL(file);
  //     setFileBlobUrl(blobUrl);
  //   }
  // };

  return (
    <div>
      {/* {fileBlobUrl ? (
        <SmelterCanvas onCanvasCreate={onCanvasCreate} width={480} height={270}>
          <Rescaler
            style={{
              borderRadius: 24,
              borderColor: "white",
              borderWidth: 1,
            }}>
            <Mp4 source={fileBlobUrl} />
          </Rescaler>
        </SmelterCanvas>
      ) : (
        <div className="flex w-[480px] justify-center">
          <input
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            className="self-center"
          />
        </div>
      )} */}
    </div>
  );
}
