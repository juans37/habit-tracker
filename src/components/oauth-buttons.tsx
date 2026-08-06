"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PROVIDERS = [
  {
    id: "google" as const,
    label: "Continuar con Google",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        />
      </svg>
    ),
  },
  {
    id: "github" as const,
    label: "Continuar con GitHub",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#F2F1EC">
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.79 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.68.8.56A10.52 10.52 0 0023.5 12c0-6.27-5.23-11.5-11.5-11.5z" />
      </svg>
    ),
  },
];

export function OAuthButtons() {
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(provider: "google" | "github") {
    setError(null);
    setCargando(provider);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setCargando(null);
    }
    // Si no hay error, el navegador redirige al proveedor — no hace falta más estado.
  }

  return (
    <div className="flex flex-col gap-2.5">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => handleClick(provider.id)}
          disabled={cargando !== null}
          className="flex items-center justify-center gap-2.5 rounded-lg border border-border-strong bg-surface py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
        >
          {provider.icon}
          {cargando === provider.id ? "Redirigiendo..." : provider.label}
        </button>
      ))}
      {error && <p className="text-[13px] text-danger">{error}</p>}
    </div>
  );
}
