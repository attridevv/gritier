"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent font-display text-lg animate-pulse">Loading GRIT...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <div className="max-w-6xl mx-auto py-8 px-6">{children}</div>
      </main>
    </div>
  );
}
