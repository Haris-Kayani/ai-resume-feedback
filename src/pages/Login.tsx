import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import {
  AuthPasswordField,
  AuthPrimaryButton,
  AuthTextField,
} from "@/components/auth/AuthControls";
import LoginBgImage from "@/assets/img/LoginBg.avif";

type Mode = "login" | "register";

type Props = {
  initialMode?: Mode;
};

export default function Login({ initialMode }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, loading, error } = useAuthStore();
  const nav = useNavigate();
  const loc = useLocation();
  const from = useMemo(() => {
    const state = loc.state as unknown as { from?: string } | null;
    return state?.from || "/app";
  }, [loc.state]);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setPassword("");
  }, [mode]);

  async function onSubmit() {
    if (mode === "login") await login(email, password);
    else await register(email, password);
    nav(from, { replace: true });
  }

  const canSubmit = !!email && password.length >= 8;
  const ctaLabel = mode === "login" ? "Sign in" : "Create an account";

  if (mode === "register") {
    return (
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-fuchsia-400 to-cyan-300" />
          <div className="absolute inset-0 opacity-60 [filter:blur(40px)] bg-[radial-gradient(circle_at_30%_30%,#fb7185,transparent_50%),radial-gradient(circle_at_70%_40%,#a855f7,transparent_55%),radial-gradient(circle_at_40%_75%,#22d3ee,transparent_55%)]" />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <img
              src="/SignUp.avif"
              alt="Sign up illustration"
              className="max-w-[85%] max-h-[85%] w-auto h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="relative flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[520px] motion-safe:animate-[auth-fade_220ms_ease-out] motion-reduce:animate-none">
            <div className="mb-8">
              <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">
                Create an account
              </h1>
            </div>

            <div className="space-y-5">
              <AuthTextField
                id="signup-email"
                label="Email address"
                value={email}
                onChange={setEmail}
                type="email"
                inputMode="email"
                autoComplete="email"
              />
              <AuthPasswordField
                id="signup-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                helper="Use 8 or more characters with a mix of letters, numbers & symbols"
              />

              <div className="text-xs text-zinc-500">
                By creating an account, you agree to our{" "}
                <a
                  className="text-zinc-800 underline-offset-2 hover:underline"
                  href="#"
                >
                  Terms of use
                </a>{" "}
                and{" "}
                <a
                  className="text-zinc-800 underline-offset-2 hover:underline"
                  href="#"
                >
                  Privacy Policy
                </a>
                .
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <AuthPrimaryButton
                label={loading ? "Working…" : "Create an account"}
                onClick={() => void onSubmit()}
                disabled={loading || !canSubmit}
                loading={loading}
              />

              <div className="text-sm text-zinc-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    nav("/login");
                  }}
                  className="font-medium text-zinc-800 underline-offset-2 hover:underline"
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen px-4"
      style={{
        backgroundImage: `url(${LoginBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-[480px] px-4 motion-safe:animate-[auth-pop_240ms_ease-out] motion-reduce:animate-none">
          <div className="relative rounded-[28px] bg-white px-6 py-8 sm:px-8 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
            <button
              type="button"
              onClick={() => nav("/", { replace: true })}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-md p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-zinc-600">
                <img
                  src="/title.avif"
                  alt="Resume Fix"
                  className="h-5 w-5 rounded object-contain"
                />
                <span>Resume Fix</span>
              </div>
              <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-zinc-900">
                Sign in
              </h1>
            </div>

            <div className="space-y-5">
              <AuthTextField
                id="login-email"
                label="Email or phone number"
                value={email}
                onChange={setEmail}
                type="email"
                inputMode="email"
                autoComplete="email"
              />
              <AuthPasswordField
                id="login-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <AuthPrimaryButton
                label={loading ? "Signing in…" : ctaLabel}
                onClick={() => void onSubmit()}
                disabled={loading || !canSubmit}
                loading={loading}
              />

              <div className="pt-2 text-sm text-zinc-700">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    nav("/signup");
                  }}
                  className="font-medium text-zinc-800 underline-offset-2 hover:underline"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
