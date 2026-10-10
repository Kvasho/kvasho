import BackgroundFx from "@/components/background-fx";

export default function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="bg-blob bg-blob-a" />
      <div className="bg-blob bg-blob-b" />
      <div className="bg-blob bg-blob-c" />
      <div className="bg-grid-mask">
        <div className="bg-grid" />
      </div>
      <BackgroundFx />
    </div>
  );
}
