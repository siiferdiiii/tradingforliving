"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Check, Camera } from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { UserProfile } from "@/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const prof = DatabaseManager.getProfile();
    if (prof) {
      setProfile(prof);
      setDisplayName(prof.displayName);
      setBio(prof.bio || "");
      setAvatarUrl(prof.avatarUrl || "");
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    setTimeout(() => {
      const updatedProfile: UserProfile = {
        ...profile!,
        displayName,
        bio,
        avatarUrl
      };
      DatabaseManager.saveProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsLoading(false);
      setSuccess(true);
      
      // Clear success alert after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  if (!isClient || !profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Pengaturan Profil
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Perbarui data personal, bio ringkas, dan visual avatar trader Anda.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          Profil berhasil diperbarui secara lokal!
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/5 p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Circular Avatar Uploader */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-900">
          <div className="relative w-24 h-24 rounded-full group cursor-pointer border border-zinc-800">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar Preview"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600">
                <User className="w-10 h-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white">Avatar Profil</h3>
            <p className="text-[11px] text-zinc-500">Klik lingkaran di samping untuk mengunggah avatar kustom.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Lengkap (Display Name)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Rivera"
                required
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 text-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">@</span>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full bg-zinc-950/20 border border-white/5 rounded-xl pl-8 pr-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Alamat Email (Non-editable)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                value="alex.rivera@example.com"
                disabled
                className="w-full bg-zinc-950/20 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bio Trader</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan tentang model, teknik, instrumen utama, atau filosofi trading Anda..."
              rows={4}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 resize-none text-zinc-200"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900/60">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Simpan Perubahan
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
