import { ReactNode } from "react";

// Each auth page manages its own full-screen layout and background.
// This wrapper is intentionally minimal to avoid double-nesting conflicts.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
