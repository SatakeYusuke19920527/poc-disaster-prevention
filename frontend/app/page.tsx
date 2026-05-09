import { ChatWindow } from "@/components/ChatWindow";
import { MapPanel } from "@/components/MapPanel";

export default function Home() {
  return (
    <main className="flex h-screen w-full">
      <ChatWindow />
      <MapPanel />
    </main>
  );
}
