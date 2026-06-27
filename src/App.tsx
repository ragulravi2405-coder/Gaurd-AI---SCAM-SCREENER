import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { ScanRecord, AnalysisResult } from "./types";
import Header from "./components/Header";
import AuthForm from "./components/AuthForm";
import ScannerForm from "./components/ScannerForm";
import ResultsView from "./components/ResultsView";
import HistoryList from "./components/HistoryList";
import ProfileCustomizer from "./components/ProfileCustomizer";
import { Language, translations } from "./components/translations";
import { motion } from "motion/react";
import { 
  ShieldCheck, ShieldAlert, Scale, BrainCircuit, RefreshCw, Layers, CheckCircle2,
  FileWarning, HelpCircle, ArrowRight, UserPlus
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authFormVisible, setAuthFormVisible] = useState(false);
  const [profileCustomizerVisible, setProfileCustomizerVisible] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("guarai_lang");
    return (saved as Language) || "en";
  });
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("guarai_lang", newLang);
  };

  // Synchronize authenticated user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthFormVisible(false);
      setCurrentResult(null);
    });
    return unsubscribe;
  }, []);

  // Fetch scan logs whenever user logs in or changes
  const fetchScans = async () => {
    setHistoryLoading(true);
    try {
      if (user) {
        const scansCol = collection(db, "scans");
        const querySnapshot = await getDocs(query(scansCol, where("userId", "==", user.uid)));
        
        // Map and sort in memory by timestamp desc safely
        const fetched = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp
          } as ScanRecord;
        });
        
        fetched.sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });

        setScans(fetched);
      } else {
        // Fallback to guest storage history
        const rawHistory = localStorage.getItem("screener_guest_history");
        if (rawHistory) {
          setScans(JSON.parse(rawHistory));
        } else {
          setScans([]);
        }
      }
    } catch (e) {
      console.error("Error retrieving Firestore records:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [user]);

  // Handle document submission for scam analysis
  const handleAnalyze = async (
    text: string, 
    file: { data: string; mimeType: string; fileName: string } | null
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, file })
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.error || "Decompiling document failed.");
      }

      const parsedResult: AnalysisResult = await response.json();
      setCurrentResult(parsedResult);

      const titleVal = file 
        ? file.fileName 
        : (text.trim().slice(0, 40) + (text.length > 40 ? "..." : ""));

      const recordMock: Omit<ScanRecord, "id"> = {
        ...parsedResult,
        userId: user ? user.uid : "guest",
        title: titleVal,
        timestamp: new Date()
      };

      if (user) {
        // Write to Firestore db
        try {
          const docRef = await addDoc(collection(db, "scans"), recordMock);
          const finalRecord: ScanRecord = {
            id: docRef.id,
            ...recordMock
          };
          setScans((prev) => [finalRecord, ...prev]);
        } catch (dbErr) {
          console.error("Firestore write failed:", dbErr);
          // Fallback locally
          const finalRecord: ScanRecord = {
            id: `err_${Date.now()}`,
            ...recordMock
          };
          setScans((prev) => [finalRecord, ...prev]);
        }
      } else {
        // Write to localStorage
        const rawHistory = localStorage.getItem("screener_guest_history");
        const list = rawHistory ? JSON.parse(rawHistory) : [];
        const finalRecord: ScanRecord = {
          id: `guest_${Date.now()}`,
          ...recordMock
        };
        const updated = [finalRecord, ...list];
        localStorage.setItem("screener_guest_history", JSON.stringify(updated));
        setScans(updated);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to finalize document scan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete history scan
  const handleDeleteScan = async (id: string, e: any) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this scan entry?")) return;

    try {
      if (user && !id.startsWith("guest_") && !id.startsWith("err_")) {
        await deleteDoc(doc(db, "scans", id));
      }
      
      const updated = scans.filter((s) => s.id !== id);
      setScans(updated);

      if (!user) {
        localStorage.setItem("screener_guest_history", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  const handleSelectHistoricalScan = (record: ScanRecord) => {
    setCurrentResult(record);
    setActiveTab("scan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-100/60 via-indigo-50/20 to-fuchsia-50/20 font-sans text-slate-800 pb-16">
      
      {/* 1. Header Navigation block */}
      <Header
        user={user}
        onShowAuth={() => setAuthFormVisible(true)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "history") setCurrentResult(null);
        }}
        historyCount={scans.length}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onShowProfileCustomizer={() => setProfileCustomizerVisible(true)}
      />

      {/* 2. Authentication Modal Popup */}
      {authFormVisible && (
        <AuthForm
          onClose={() => setAuthFormVisible(false)}
          onSuccess={() => fetchScans()}
        />
      )}

      {/* Profile Customizer Modal */}
      {profileCustomizerVisible && user && (
        <ProfileCustomizer
          user={user}
          onClose={() => setProfileCustomizerVisible(false)}
          lang={lang}
        />
      )}

      {/* 3. Main Workspace Container */}
      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        {activeTab === "scan" ? (
          <div className="space-y-8">
            
            {/* Show landing page details when no active results or loading is displayed */}
            {!currentResult && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center max-w-2xl mx-auto mb-10 space-y-4"
              >
                <div className="inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-md text-fuchsia-700 text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase border border-white shadow-2xs">
                  <BrainCircuit className="w-4 h-4 animate-spin text-fuchsia-600" />
                  {t.agencyIntelligence}
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  {t.landingTitle}
                </h2>
                
                <p className="text-sm sm:text-base text-slate-600/95 leading-relaxed max-w-xl mx-auto font-medium">
                  {t.landingDesc}
                </p>

                {/* Educational Bento grid for Consumer Rights protection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
                  <div className="p-4.5 bg-white/45 backdrop-blur-xl rounded-[24px] border border-white shadow-2xs">
                    <div className="p-2 bg-amber-50/60 rounded-lg text-amber-600 w-fit mb-2.5 border border-white">
                      <Scale className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-xs tracking-wider uppercase text-slate-800">{t.exitPenaltiesTitle}</h4>
                    <p className="text-[11.5px] text-slate-550 mt-1 leading-relaxed font-semibold">
                      {t.exitPenaltiesDesc}
                    </p>
                  </div>

                  <div className="p-4.5 bg-white/45 backdrop-blur-xl rounded-[24px] border border-white shadow-2xs">
                    <div className="p-2 bg-indigo-50/60 rounded-lg text-indigo-650 w-fit mb-2.5 border border-white">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-xs tracking-wider uppercase text-slate-800">{t.subLoopsTitle}</h4>
                    <p className="text-[11.5px] text-slate-550 mt-1 leading-relaxed font-semibold">
                      {t.subLoopsDesc}
                    </p>
                  </div>

                  <div className="p-4.5 bg-white/45 backdrop-blur-xl rounded-[24px] border border-white shadow-2xs">
                    <div className="p-2 bg-red-50/60 rounded-lg text-red-550 w-fit mb-2.5 border border-white">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-xs tracking-wider uppercase text-slate-800">{t.phishingTitle}</h4>
                    <p className="text-[11.5px] text-slate-550 mt-1 leading-relaxed font-semibold">
                      {t.phishingDesc}
                    </p>
                  </div>
                </div>

                {!user && (
                  <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-left shadow-2xs">
                    <div>
                      <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-indigo-500" />
                        {t.archiveNoticeTitle}
                      </h4>
                      <p className="text-xs text-slate-650 mt-0.5 font-semibold">
                        {t.archiveNoticeDesc}
                      </p>
                    </div>
                    <button
                      onClick={() => setAuthFormVisible(true)}
                      className="px-4.5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {t.makeAccount}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Error alerts */}
            {error && (
              <div className="bg-red-50/30 backdrop-blur-md border border-red-200/50 text-red-900 rounded-[24px] p-5 text-sm max-w-4xl mx-auto flex items-start gap-3">
                <FileWarning className="w-5.5 h-5.5 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <h4 className="font-bold">{t.warningHeader}</h4>
                  <p className="text-xs text-red-750 mt-1 font-semibold">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-3.5 px-4 py-2 border border-red-200/40 hover:bg-white bg-white/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {t.clearWarning}
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Loading Screen */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/55 backdrop-blur-2xl rounded-[32px] border border-white shadow-xl shadow-slate-100/30 p-12 text-center max-w-4xl mx-auto space-y-6"
              >
                <div className="relative flex items-center justify-center mx-auto w-16 h-16 bg-white/70 rounded-2.5xl text-indigo-600 border border-white">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <h3 className="text-lg font-extrabold text-slate-800">{t.decompilingTitle}</h3>
                  <p className="text-xs text-slate-550 font-bold leading-relaxed">
                    {t.decompilingSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-xl mx-auto">
                  <div className="p-3.5 bg-white/40 backdrop-blur-xs rounded-xl border border-white">
                    <span className="text-[10px] text-indigo-500 font-extrabold tracking-widest block uppercase">{t.step1}</span>
                    <span className="text-xs text-slate-650 font-bold">{t.step1Desc}</span>
                  </div>
                  <div className="p-3.5 bg-white/40 backdrop-blur-xs rounded-xl border border-white">
                    <span className="text-[10px] text-fuchsia-500 font-extrabold tracking-widest block uppercase">{t.step2}</span>
                    <span className="text-xs text-slate-650 font-bold">{t.step2Desc}</span>
                  </div>
                  <div className="p-3.5 bg-white/40 backdrop-blur-xs rounded-xl border border-white">
                    <span className="text-[10px] text-amber-500 font-extrabold tracking-widest block uppercase">{t.step3}</span>
                    <span className="text-xs text-slate-650 font-bold">{t.step3Desc}</span>
                  </div>
                  <div className="p-3.5 bg-white/40 backdrop-blur-xs rounded-xl border border-white">
                    <span className="text-[10px] text-emerald-500 font-extrabold tracking-widest block uppercase">{t.step4}</span>
                    <span className="text-xs text-slate-650 font-bold">{t.step4Desc}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Output Board */}
            {currentResult && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ResultsView
                  result={currentResult}
                  lang={lang}
                  onReset={() => {
                    setCurrentResult(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </motion.div>
            )}

            {/* Scan Inputs Panel */}
            {!currentResult && !loading && (
              <ScannerForm
                onAnalyze={handleAnalyze}
                loading={loading}
                lang={lang}
              />
            )}

          </div>
        ) : (
          /* Scan history tab view */
          <HistoryList
            scans={scans}
            onSelectScan={handleSelectHistoricalScan}
            onDeleteScan={handleDeleteScan}
            loading={historyLoading}
            onRefresh={fetchScans}
            lang={lang}
          />
        )}

      </main>

    </div>
  );
}
