import { User, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { ShieldCheck, LogOut, History, FileSearch, User as UserIcon, Globe, Settings } from "lucide-react";
import { Language, translations } from "./translations";

interface HeaderProps {
  user: User | null;
  onShowAuth: () => void;
  activeTab: "scan" | "history";
  onTabChange: (tab: "scan" | "history") => void;
  historyCount: number;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onShowProfileCustomizer: () => void;
}

export default function Header({ 
  user, 
  onShowAuth, 
  activeTab, 
  onTabChange, 
  historyCount,
  lang,
  onLanguageChange,
  onShowProfileCustomizer
}: HeaderProps) {
  const t = translations[lang];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-xs px-4 py-3.5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-200/50 hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-800 bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                {t.brandName}
              </h1>
              <p className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Quick Language Dropdown on mobile */}
          <div className="md:hidden flex items-center gap-1 bg-white/60 border border-indigo-100 rounded-xl px-2 py-1.5 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={lang}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          
          {/* Main Navigation tabs (visible if logged in) */}
          {user && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onTabChange("scan")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "scan"
                    ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-100/30"
                    : "text-slate-600 hover:bg-white/60"
                }`}
              >
                <FileSearch className="w-4 h-4" />
                <span>{t.newScan}</span>
              </button>

              <button
                onClick={() => onTabChange("history")}
                className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-100/30"
                    : "text-slate-600 hover:bg-white/60"
                }`}
              >
                <History className="w-4 h-4" />
                <span>{t.myScans}</span>
                {historyCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white animate-bounce">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Desktop Language Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/60 border border-indigo-100 rounded-xl px-2.5 py-2 shadow-2xs">
            <Globe className="w-4 h-4 text-indigo-500" />
            <select
              value={lang}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block" />

          {/* User Section */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {user ? (
              <div className="flex items-center gap-2">
                
                {/* Profile Settings and Info */}
                <button
                  onClick={onShowProfileCustomizer}
                  title="Customize profile & avatar"
                  className="flex items-center gap-2 p-1 rounded-2xl bg-white/60 hover:bg-white border border-indigo-100/80 shadow-2xs cursor-pointer group transition-all duration-200 hover:border-indigo-300"
                >
                  <div className="p-0.5 rounded-full bg-slate-100 group-hover:scale-105 transition-transform">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-7 h-7 rounded-full object-cover border border-white"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-450 via-indigo-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="hidden sm:flex flex-col items-start pr-2">
                    <span className="text-[11px] font-bold text-slate-700 max-w-[100px] truncate leading-tight">
                      {user.displayName || user.email?.split("@")[0] || "User"}
                    </span>
                    <span className="text-[8px] text-emerald-600 font-extrabold tracking-widest uppercase flex items-center gap-0.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                      {t.secureStatus}
                    </span>
                  </div>

                  <Settings className="hidden sm:block w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 group-hover:rotate-45 transition-all mr-1.5" />
                </button>

                {/* Log Out Button */}
                <button
                  onClick={handleSignOut}
                  title={t.signOutTooltip}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-purple-650 to-fuchsia-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t.signInBtn}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

