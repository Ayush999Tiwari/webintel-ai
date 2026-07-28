"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Redirects to /login if no access_token is present (set by src/app/login/page.tsx). */
function hasToken() {
  return typeof window !== "undefined" && !!window.localStorage.getItem("access_token");
}

export function useAuthGuard() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);   // ✅ hamesha false se shuru — server/client match

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/login");
    } else {
      setChecked(true);   
    }
  }, [router]);

  return { checked };
}