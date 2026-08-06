"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { OAuthButtons } from "@/components/oauth-buttons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/hoy");
    router.refresh();
  }

  return (
    <AuthShell title="Iniciar sesión" subtitle="Volvé a tu secuencia de hoy">
      <OAuthButtons />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          o con email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent py-2.5 text-sm font-bold text-surface disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-faint">
        ¿No tenés cuenta?{" "}
        <Link href="/signup" className="font-semibold text-accent">
          Registrate
        </Link>
      </p>
    </AuthShell>
  );
}
