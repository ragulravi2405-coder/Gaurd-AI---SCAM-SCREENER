import { ScanRecord } from "../types";
import { 
  FileSearch, Trash2, Calendar, ShieldCheck, AlertTriangle, AlertOctagon, RefreshCw 
} from "lucide-react";
import { Language, translations } from "./translations";

interface HistoryListProps {
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  onDeleteScan: (id: string, e: any) => void;
  loading: boolean;
  onRefresh: () => void;
  lang: Language;
}

export default function HistoryList({ scans, onSelectScan, onDeleteScan, loading, onRefresh, lang }: HistoryListProps) {
  const t = translations[lang];
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    
    // Check if Firebase Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(
      lang === "ta" ? "ta-IN" :
      lang === "hi" ? "hi-IN" :
      lang === "ml" ? "ml-IN" :
      lang === "te" ? "te-IN" :
      lang === "kn" ? "kn-IN" : "en-US", 
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  const getLocalizedTitle = () => {
    switch (lang) {
      case "ta": return "உங்கள் பாதுகாப்பு ஸ்கேன் வரலாறு";
      case "hi": return "आपका सुरक्षित स्कैन इतिहास";
      case "ml": return "നിങ്ങളുടെ സുരക്ഷിത സ്കാൻ ചരിത്രം";
      case "te": return "మీ సురక్షిత స్కాన్ చరిత్ర";
      case "kn": return "ನಿಮ್ಮ ಸುರಕ್ಷಿತ ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ";
      default: return "Your Safe Scan History";
    }
  };

  const getLocalizedDesc = () => {
    switch (lang) {
      case "ta": return `உங்கள் கணக்கில் ஒத்திசைக்கப்பட்ட வரலாற்றுப் பதிவுகள் (மொத்தம் ${scans.length} ஸ்கேன்கள்)`;
      case "hi": return `आपके खाते में सिंक किए गए स्कैन लॉग (कुल ${scans.length} स्कैन)`;
      case "ml": return `നിങ്ങളുടെ അക്കൗണ്ടിൽ സമന്വയിപ്പിച്ച സ്കാൻ ചരിത്രം (ആകെ ${scans.length} സ്കാനുകൾ)`;
      case "te": return `మీ ఖాతా ప్రొఫైల్‌లో సమకాలీకరించబడిన లాగ్‌లు (మొత్తం ${scans.length} స్కాన్‌లు)`;
      case "kn": return `ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಸಿಂಕ್ ಮಾಡಲಾದ ಇತಿಹಾಸ (ಒಟ್ಟು ${scans.length} ಸ್ಕ್ಯಾನ್‌ಗಳು)`;
      default: return `Saved logs synchronized on your account profile (${scans.length} scans total)`;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Header with counter and reload */}
      <div className="flex items-center justify-between gap-3 bg-white/50 backdrop-blur-xl border border-white p-4.5 rounded-[24px] shadow-sm">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full" />
            {getLocalizedTitle()}
          </h3>
          <p className="text-xs text-slate-550 font-medium mt-0.5">
            {getLocalizedDesc()}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 bg-white/60 border border-white hover:bg-white rounded-xl transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-40"
          title="Reload history log"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main deck */}
      {loading && scans.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-xl border border-white rounded-[32px] p-12 text-center text-slate-500 font-medium shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
          {lang === "ta" ? "ஸ்கேன் வரலாற்றை ஒத்திசைக்கிறது..." : 
           lang === "hi" ? "स्कैन इतिहास को सिंक्रनाइज़ किया जा रहा है..." : 
           lang === "ml" ? "സ്കാൻ ചരിത്രം സമന്വയിപ്പിക്കുന്നു..." : 
           lang === "te" ? "స్కాన్ చరిత్రను సింక్రనైజ్ చేస్తోంది..." : 
           lang === "kn" ? "ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸವನ್ನು ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : 
           "Synchronizing scan history..."}
        </div>
      ) : scans.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-xl border-2 border-dashed border-white rounded-[32px] p-12 text-center text-slate-500 shadow-sm">
          <FileSearch className="w-12 h-12 mx-auto text-slate-450 mb-4" />
          <p className="font-bold text-slate-800">
            {lang === "ta" ? "இன்னும் ஸ்கேன் பதிவுகள் எதுவும் இல்லை" : 
             lang === "hi" ? "अभी तक कोई स्कैन लॉग नहीं मिला है" : 
             lang === "ml" ? "സ്കാൻ രേഖകൾ ഒന്നും കണ്ടെത്തിയിട്ടില്ല" : 
             lang === "te" ? "ఇంకా ఎటువంటి స్కాన్ లాగ్‌లు లేవు" : 
             lang === "kn" ? "ಯಾವುದೇ ಸ್ಕ್ಯಾನ್ ಲಾಗ್‌ಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ" : 
             "No scanned logs detected yet"}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium leading-relaxed">
            {lang === "ta" ? "நீங்கள் ஸ்கேன் செய்யும் கோப்புகள் மற்றும் செய்திகள் இங்கு பாதுகாப்பாகச் சேமிக்கப்படும். புதிய ஸ்கேன் பிரிவில் தொடங்கவும்!" : 
             lang === "hi" ? "आपके द्वारा स्कैन की गई फ़ाइलें और संदेश यहाँ सुरक्षित रूप से सहेज जाएंगे। नया स्कैन शुरू करें!" : 
             lang === "ml" ? "നിങ്ങൾ സ്കാൻ ചെയ്യുന്ന ഫയലുകളും സന്ദേശങ്ങളും ഇവിടെ സുരക്ഷിതമായി സൂക്ഷിക്കും. ഒരു പുതിയ സ്കാൻ ആരംഭിക്കുക!" : 
             lang === "te" ? "మీరు స్కాన్ చేసిన ఫైల్‌లు మరియు సందేశాలు ఇక్కడ సురక్షితంగా సేవ్ చేయబడతాయి. కొత్త స్కాన్ ప్రారంభించండి!" : 
             lang === "kn" ? "ನೀವು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಫೈಲ್‌ಗಳು ಮತ್ತು ಸಂದೇಶಗಳು ಇಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಉಳಿಯುತ್ತವೆ. ಹೊಸ ಸ್ಕ್ಯಾನ್ ಪ್ರಾರಂಭಿಸಿ!" : 
             "Your scanned files, agreements, and message warning audits will be displayed here securely. Submit a clause on the New Scan tab!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scans.map((scan) => {
            const isDanger = scan.verdict === "HIGH_RISK";
            const isCaution = scan.verdict === "CAUTION";
            
            let statusIcon = <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />;
            let statusClass = "bg-emerald-50/30 backdrop-blur-md border-emerald-100 hover:border-emerald-300 text-emerald-900 shadow-sm rounded-[24px]";
            
            if (isDanger) {
              statusIcon = <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />;
              statusClass = "bg-red-50/35 backdrop-blur-md border-red-150 hover:border-red-300 text-red-900 shadow-sm rounded-[24px]";
            } else if (isCaution) {
              statusIcon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
              statusClass = "bg-amber-50/30 backdrop-blur-md border-amber-150 hover:border-amber-300 text-amber-900 shadow-sm rounded-[24px]";
            }

            return (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className={`flex flex-col justify-between p-5 border transition-all cursor-pointer group relative overflow-hidden ${statusClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <span className="text-[10px] font-extrabold tracking-wider bg-white/90 border border-white/80 px-2 py-0.5 rounded-md text-slate-600 block uppercase">
                      {lang === "ta" ? "ஆபத்து குறியீடு" : lang === "hi" ? "जोखिम सूचकांक" : lang === "ml" ? "അപായ സൂചിക" : lang === "te" ? "ప్రమాద సూచిక" : lang === "kn" ? "ಅಪಾಯದ ಸೂಚ್ಯಂಕ" : "Risk Index"}: {scan.riskScore}
                    </span>

                    <button
                      onClick={(e) => onDeleteScan(scan.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white/85 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mt-3 max-w-[90%] truncate">
                    {scan.title || (lang === "ta" ? "ஆவண ஸ்கேன் மதிப்பீடு" : lang === "hi" ? "दस्तावेज़ स्कैन मूल्यांकन" : lang === "ml" ? "രേഖ സ്കാൻ വിലയിരുത്തൽ" : lang === "te" ? "పత్రం స్కాన్ అంచనా" : lang === "kn" ? "ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಮೌಲ್ಯಮಾಪನ" : "Document Scan Assessment")}
                  </h3>
                  
                  <p className="text-[11.5px] text-slate-600 font-medium line-clamp-2 mt-1 px-1">
                    {scan.riskAssessment}
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-200/40 pt-3.5 mt-4">
                  <Calendar className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold">
                    {formatDate(scan.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
