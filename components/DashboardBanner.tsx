"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function DashboardBanner() {
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const subscribed = searchParams.get("subscribed") === "1";
  const canceled = searchParams.get("canceled") === "1";

  useEffect(() => {
    if (subscribed || canceled) {
      // Clear query params from URL without full navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("subscribed");
      url.searchParams.delete("canceled");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [subscribed, canceled]);

  // After successful checkout, webhook may have updated the user; refetch so nav shows Pro
  useEffect(() => {
    if (subscribed) {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [subscribed, setUser]);

  if (dismissed || (!subscribed && !canceled)) return null;

  return (
    <div
      className={`mb-6 rounded-xl border px-4 py-3 ${
        subscribed
          ? "border-green-800 bg-green-900/30 text-green-200"
          : "border-slate-700 bg-slate-800/50 text-slate-300"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">
          {subscribed ? "You're now a FitTrack Pro member!" : "Upgrade canceled. You can upgrade anytime from the nav."}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded px-2 py-1 text-slate-400 hover:text-white"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
