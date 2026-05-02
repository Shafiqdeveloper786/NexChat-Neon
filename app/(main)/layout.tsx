import { CyberBackground } from "@/components/cyber/CyberBackground";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: "#060b18" }}>
      <CyberBackground intensity={0.42} />
      <div className="flex flex-1 overflow-hidden relative z-10">
        {children}
      </div>
    </div>
  );
}
