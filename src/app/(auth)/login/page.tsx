"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { login, loginWithGitHub } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login({ email, password });

      if (result.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Email atau password tidak valid"
        );
        setIsLoading(false);
        return;
      }

      // Login berhasil — redirect ke dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsGithubLoading(true);
    setError("");
    try {
      const result = await loginWithGitHub();
      if (result.error) {
        setError(typeof result.error === "string" ? result.error : "Gagal login dengan GitHub");
        setIsGithubLoading(false);
        return;
      }
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsGithubLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative gradient corner */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Masuk ke TradeLog
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Lanjutkan perjalanan backtesting profesional Anda
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Alamat Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              disabled={isLoading}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Password
            </label>
            <a href="#" className="text-xs text-primary hover:text-primary-hover transition-colors">
              Lupa sandi?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl pl-11 pr-11 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative flex items-center justify-center gap-2 font-medium text-white px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-75 disabled:pointer-events-none group"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Masuk
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <span className="relative bg-zinc-950 px-3 text-xs text-zinc-500 uppercase tracking-widest">
          atau
        </span>
      </div>

      <button
        onClick={handleGithubLogin}
        disabled={isLoading || isGithubLoading}
        className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
      >
        {isGithubLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        )}
        Masuk dengan GitHub
      </button>

      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary-hover font-semibold transition-colors"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
