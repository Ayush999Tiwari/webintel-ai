
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.hash.slice(1)
    );

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const error = params.get("error");

    // Remove tokens from the visible browser URL immediately.
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    if (error || !accessToken || !refreshToken) {
      router.replace("/login?error=google_auth_failed");
      return;
    }

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);

    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <h1 className="text-lg font-semibold text-gray-900">
          Signing you in...
        </h1>
        <p className="text-sm text-gray-500">
          Please wait while we complete authentication.
        </p>
      </div>
    </main>
  );
}
