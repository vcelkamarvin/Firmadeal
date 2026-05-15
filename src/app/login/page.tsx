"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase";

function LoginForm() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(
        lang === "de"
          ? "Falsche E-Mail oder falsches Passwort. Bitte erneut versuchen."
          : "Incorrect email or password. Please try again."
      );
      setLoading(false);
    } else {
      router.push(redirect);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-baseline gap-0.5">
            <span className="font-fraunces text-[28px] text-[var(--ink)]">Firmadeal</span>
            <span className="font-fraunces text-[28px] text-[var(--muted)]">.de</span>
          </Link>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-8">
          <h1 className="font-fraunces text-[26px] text-[var(--ink)] mb-1">
            {t("auth.login_title")}
          </h1>
          <p className="font-sans text-sm text-[var(--muted)] mb-6">
            {lang === "de"
              ? "Melden Sie sich an, um Ihre Inserate zu verwalten"
              : "Sign in to manage your listings"}
          </p>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 border border-[var(--border)] rounded-xl font-sans text-sm text-[var(--ink)] hover:bg-[var(--surface2)] transition-colors mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t("auth.google")}
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 font-mono text-[11px] text-[var(--muted)]">
                {lang === "de" ? "oder mit E-Mail" : "or with email"}
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-1.5">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
                  {t("auth.password")}
                </label>
                <Link href="#" className="font-mono text-[10px] text-[var(--accent)] hover:underline">
                  {lang === "de" ? "Passwort vergessen?" : "Forgot password?"}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--accent)] text-white font-sans font-medium text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {loading
                ? lang === "de" ? "Wird angemeldet..." : "Signing in..."
                : t("auth.login_button")}
            </button>
          </form>

          <p className="text-center font-sans text-sm text-[var(--muted)] mt-5">
            {t("auth.no_account")}{" "}
            <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">
              {t("auth.register_link")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <LoginForm />
    </Suspense>
  );
}
