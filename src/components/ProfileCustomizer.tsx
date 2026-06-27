import React, { useState, useRef } from "react";
import { User, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { X, Upload, Check, UserCheck, ShieldAlert } from "lucide-react";
import { Language, translations } from "./translations";

interface ProfileCustomizerProps {
  user: User;
  onClose: () => void;
  lang: Language;
}

// 8 Elegant professional preset avatar SVGs, rendered as data URLs
const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Guardian",
  "https://api.dicebear.com/7.x/identicon/svg?seed=Shield",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lawyer",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Analyst",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Screener",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Detective",
  "https://api.dicebear.com/7.x/shapes/svg?seed=GuarAI",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Protector"
];

export default function ProfileCustomizer({ user, onClose, lang }: ProfileCustomizerProps) {
  const t = translations[lang];
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user.photoURL || PRESET_AVATARS[0]);
  const [customAvatarBase64, setCustomAvatarBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large. Limit is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomAvatarBase64(reader.result);
        setSelectedAvatar(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const finalPhotoURL = customAvatarBase64 || selectedAvatar;
      await updateProfile(user, {
        displayName: displayName.trim() || null,
        photoURL: finalPhotoURL
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Force refresh state in root
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Could not update profile information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white/70 backdrop-blur-3xl rounded-[32px] border border-white/80 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <UserCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {t.profileCustomizerTitle}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Customize how you appear across your GUAR AI workspace
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs font-semibold">
            <Check className="w-4 h-4 shrink-0" />
            <span>Profile successfully updated! Reloading...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Active Preview */}
          <div className="flex items-center gap-4 bg-white/50 border border-white p-4 rounded-2.5xl">
            <div className="relative group shrink-0">
              <img 
                src={customAvatarBase64 || selectedAvatar} 
                alt="Avatar Preview" 
                className="w-16 h-16 rounded-full border-2 border-indigo-200 object-cover shadow-sm"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0];
                }}
              />
              <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-indigo-700 font-bold tracking-wider uppercase block w-fit">
                {t.secureStatus}
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                {displayName || user.email?.split("@")[0] || "Guardian User"}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {user.email}
              </p>
            </div>
          </div>

          {/* Display Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1 block">
              {t.displayNameLabel}
            </label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
              maxLength={30}
              className="w-full bg-white/40 border border-indigo-100 rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 transition-all shadow-2xs"
            />
          </div>

          {/* Preset Avatars Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 ml-1 block">
              {t.presetAvatarsLabel}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {PRESET_AVATARS.map((avatar, idx) => {
                const isSelected = selectedAvatar === avatar && !customAvatarBase64;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(avatar);
                      setCustomAvatarBase64(null);
                    }}
                    className={`relative p-1 rounded-2xl border transition-all cursor-pointer ${
                      isSelected ? "bg-indigo-50 border-indigo-500 scale-105" : "bg-white/40 border-indigo-50 hover:bg-white"
                    }`}
                  >
                    <img 
                      src={avatar} 
                      alt={`Preset ${idx}`} 
                      className="w-full h-10 object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Picture Upload Button */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 ml-1 block">
              {t.customPicUploadLabel}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white hover:bg-indigo-50/50 border border-indigo-200 text-indigo-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <Upload className="w-4 h-4" />
                Choose Image File
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-[11px] text-slate-500 font-medium">
                {customAvatarBase64 ? "Custom image loaded!" : t.customPicDesc}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t.closeBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? t.savingProfileBtn : t.saveProfileBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
