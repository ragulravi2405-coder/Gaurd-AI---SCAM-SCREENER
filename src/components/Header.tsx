import { User, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { ShieldCheck, LogOut, History, FileSearch, User as UserIcon } from "lucide-react";

interface HeaderProps {
  user: User | null;
  onShowAuth: () => void;
  activeTab: "scan" | "history";
  onTabChange: (tab: "scan" | "history") => void;
  historyCount: number;
}

export default function Header({ user, onShowAuth, activeTab, onTabChange, historyCount }: HeaderProps) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-xs px-4 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-linear-to-tr from-sky-450 via-indigo-400 to-fuchsia-400 text-white shadow-md animate-pulse">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg sm:text-xl tracking-tight text-slate-800 bg-linear-to-r from-sky-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
              ShieldScreener
            </h1>
            <p className="hidden xs:block text-[10px] text-slate-500 font-medium tracking-wide">
              CONSUMER RIGHTS & SCAM PROTECTOR
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Navigation Tabs for Logged Users */}
              <button
                onClick={() => onTabChange("scan")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === "scan"
                    ? "bg-linear-to-r from-sky-500 to-indigo-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileSearch className="w-4 h-4" />
                <span className="hidden sm:inline">New Scan</span>
              </button>

              <button
                onClick={() => onTabChange("history")}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === "history"
                    ? "bg-linear-to-r from-indigo-500 to-fuchsia-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">My Scans</span>
                {historyCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
                    {historyCount}
                  </span>
                )}
              </button>

              {/* User Avatar & Logout */}
              <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden xs:block" />

              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-700 max-w-[124px] truncate">
                    {user.displayName || user.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold tracking-wider">SECURE</span>
                </div>
                <div className="p-1 rounded-full bg-linear-to-tr from-sky-100 to-fuchsia-100 border border-indigo-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-indigo-650 font-bold text-xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onShowAuth}
              className="flex items-center gap-1.5 bg-linear-to-r from-indigo-600 via-purple-650 to-fuchsia-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <UserIcon className="w-4 h-4" />
              Sign In to Save History
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
