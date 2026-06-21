import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — We Pray to Flourish",
  robots: { index: false, follow: false },
};

// Base admin styling, applied to every /admin page (including login).
// The dashboard chrome (nav/logout) lives in the (dash) route group so the
// login page stays clean.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased">
      {children}
    </div>
  );
}
