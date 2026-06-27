import { AnalysisResult } from "../types";
import { 
  ShieldAlert, ShieldCheck, Sparkles, AlertTriangle, AlertOctagon, HelpCircle, 
  HelpCircle as QuestionIcon, PlusCircle, ArrowUpRight, Copy, Check, ChevronRight, FileX
} from "lucide-react";
import { useState } from "react";
import { Language, translations } from "./translations";

interface ResultsViewProps {
  result: AnalysisResult;
  onReset: () => void;
  lang: Language;
}

export default function ResultsView({ result, onReset, lang }: ResultsViewProps) {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"all" | "charges" | "scams" | "clauses">("all");

  const {
    riskScore,
    verdict,
    riskAssessment,
    hiddenCharges,
    redFlags,
    keyClausesSimplified,
    actionableAdvice
  } = result;

  // Render variables according to Verdict
  let verdictColor = "text-sky-600 bg-sky-50 border-sky-100";
  let verdictDot = "bg-sky-500 shadow-sky-200";
  let verdictTitle = "Safe";
  let verdictIcon = <ShieldCheck className="w-14 h-14 text-emerald-500" />;
  let verdictBadgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";

  if (verdict === "CAUTION") {
    verdictColor = "text-amber-700 bg-amber-50 border-amber-100";
    verdictDot = "bg-amber-500 shadow-amber-200";
    verdictTitle = lang === "ta" ? "மறைமுக அபாயங்கள் மற்றும் கட்டணங்கள் கண்டறியப்பட்டுள்ளன" :
                   lang === "hi" ? "संभावित जोखिम और शुल्क पाए गए" :
                   lang === "ml" ? "ചില അപായ സാധ്യതകൾ കണ്ടെത്തിയിരിക്കുന്നു" :
                   lang === "te" ? "దాచిన ప్రమాదాలు మరియు చార్జీలు గుర్తించబడ్డాయి" :
                   lang === "kn" ? "ಅಪಾಯಗಳು ಮತ್ತು ಶುಲ್ಕಗಳು ಪತ್ತೆಯಾಗಿವೆ" :
                   "Potential Risks & Charges Detected";
    verdictIcon = <AlertTriangle className="w-14 h-14 text-amber-500" />;
    verdictBadgeBg = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (verdict === "HIGH_RISK") {
    verdictColor = "text-red-700 bg-red-50 border-red-100";
    verdictDot = "bg-red-500 shadow-red-200";
    verdictTitle = lang === "ta" ? "உயரளவு ஆபத்து / மோசடி எச்சரிக்கை!" :
                   lang === "hi" ? "उच्च खतरा / सक्रिय घोटाला चिह्नित!" :
                   lang === "ml" ? "ഉയർന്ന റിസ്ക് / സജീവ തട്ടിപ്പ് മുന്നറിയിപ്പ്!" :
                   lang === "te" ? "తీవ్రమైన ప్రమాదం / మోసం హెచ్చరిక!" :
                   lang === "kn" ? "ಹೆಚ್ಚಿನ ಅಪಾಯ / ಸಕ್ರಿಯ ಹಗರಣ ಪತ್ತೆಯಾಗಿದೆ!" :
                   "High Danger / Active Threat Flagged!";
    verdictIcon = <AlertOctagon className="w-14 h-14 text-red-500" />;
    verdictBadgeBg = "bg-red-50 text-red-800 border-red-200";
  } else {
    verdictTitle = lang === "ta" ? "பாதுகாப்பானது" :
                   lang === "hi" ? "सुरक्षित" :
                   lang === "ml" ? "സുരക്ഷിതം" :
                   lang === "te" ? "సురక్షితం" :
                   lang === "kn" ? "ಸುರಕ್ಷಿತ" :
                   "Safe / Clean";
  }

  const handleCopyReport = () => {
    const reportText = `GUAR AI Analysis Report:
Verdict: ${verdict} (Risk Score: ${riskScore}/100)
Assessment: ${riskAssessment}

${hiddenCharges.length > 0 ? "SURPRISE OR HIDDEN CHARGES:\n" + hiddenCharges.map(c => `- ${c.chargeName} (Severity: ${c.severity}): ${c.explanation}`).join("\n") : "No hidden charges explicitly detected."}

${redFlags.length > 0 ? "RED FLAGS & SCAM INDICATORS:\n" + redFlags.map(f => `- [${f.riskCategory}] ${f.title}: ${f.explanation}`).join("\n") : "No major malicious characteristics detected."}

RECOMMENDED ACTIONABLE STEPS:
${actionableAdvice.map((a, i) => `${i + 1}. ${a}`).join("\n")}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 1. Main Assessment Hero Card */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] border border-white shadow-xl shadow-indigo-150/20 overflow-hidden p-6 sm:p-8 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-white/30 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          
          {/* Radial Needle Ring or Visual Meter */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="50"
                cx="64"
                cy="64"
              />
              <circle
                className={
                  verdict === "HIGH_RISK" 
                    ? "text-red-500" 
                    : verdict === "CAUTION" 
                      ? "text-amber-500" 
                      : "text-emerald-500"
                }
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - riskScore / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="50"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-800">{riskScore}</span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">{t.riskIndexLabel}</span>
            </div>
          </div>

          {/* Assessment & Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-2.5 mb-2">
              <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${verdictBadgeBg}`}>
                {verdict} VERDICT
              </div>
              <span className="text-xs text-slate-400 font-semibold">Processed via GUAR AI Screener</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
              {verdictTitle}
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5 font-medium">
              {riskAssessment}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-5">
              <button
                onClick={handleCopyReport}
                className="text-xs font-bold text-slate-650 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span className="text-emerald-700">{t.copiedReportBtn}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyReportBtn}</span>
                  </>
                )}
              </button>

              <button
                onClick={onReset}
                className="text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                {t.scanAnotherBtn}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Dynamic Details Selector Tabs */}
      <div className="flex bg-white/30 backdrop-blur-md border border-white/50 p-1 rounded-2xl w-full text-xs font-bold tracking-wide shadow-2xs">
        <button
          onClick={() => setActiveSegment("all")}
          className={`flex-1 text-center py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSegment === "all" ? "bg-white/90 text-indigo-950 shadow-xs" : "text-slate-600 hover:text-indigo-950"
          }`}
        >
          {t.allDataTab}
        </button>
        <button
          onClick={() => setActiveSegment("charges")}
          className={`flex-1 text-center py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSegment === "charges" ? "bg-white/90 text-indigo-950 shadow-xs" : "text-slate-600 hover:text-indigo-950"
          }`}
        >
          {t.chargesTab} ({hiddenCharges.length})
        </button>
        <button
          onClick={() => setActiveSegment("scams")}
          className={`flex-1 text-center py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSegment === "scams" ? "bg-white/90 text-indigo-950 shadow-xs" : "text-slate-600 hover:text-indigo-950"
          }`}
        >
          {t.redFlagsTab} ({redFlags.length})
        </button>
        <button
          onClick={() => setActiveSegment("clauses")}
          className={`flex-1 text-center py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSegment === "clauses" ? "bg-white/90 text-indigo-950 shadow-xs" : "text-slate-600 hover:text-indigo-950"
          }`}
        >
          {t.clausesTab} ({keyClausesSimplified.length})
        </button>
      </div>

      {/* 3. Render Selection Content */}
      <div className="space-y-6">
        
        {/* SECTION A: HIDDEN OR UNEXPECTED CHARGES */}
        {(activeSegment === "all" || activeSegment === "charges") && (
          <div className="bg-white/50 backdrop-blur-2xl rounded-[32px] border border-white shadow-sm overflow-hidden p-5 sm:p-7">
            <h4 className="text-sm font-extrabold text-slate-800 tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
              {t.chargesHeading}
            </h4>

            {hiddenCharges.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                {t.noChargesDetected}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hiddenCharges.map((charge, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-slate-750 uppercase">
                          {charge.chargeName}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          charge.severity === "high" 
                            ? "bg-red-100 text-red-800" 
                            : charge.severity === "medium" 
                              ? "bg-amber-100 text-amber-800"
                              : "bg-sky-100 text-sky-800"
                        }`}>
                          {charge.severity.toUpperCase()} ALERT
                        </span>
                      </div>

                      {charge.extractedQuote && (
                        <p className="text-[10px] sm:text-xs text-slate-550 italic bg-white/60 border border-white p-2 rounded-xl mt-2.5 font-mono">
                          &ldquo;{charge.extractedQuote}&rdquo;
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-slate-650 mt-2.5 font-semibold">
                        <span className="font-extrabold text-slate-750">
                          {lang === "ta" ? "உண்மையான செலவு விவரம்: " :
                           lang === "hi" ? "वास्तविक खर्च: " :
                           lang === "ml" ? "യഥാർത്ഥ ചിലവ്: " :
                           lang === "te" ? "నిజమైన ఖర్చు: " :
                           lang === "kn" ? "ನಿಜವಾದ ವೆಚ್ಚ: " :
                           "What this costs you: "}
                        </span>
                        {charge.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION B: SCAM WARNING FLAGS */}
        {(activeSegment === "all" || activeSegment === "scams") && (
          <div className="bg-white/50 backdrop-blur-2xl rounded-[32px] border border-white shadow-sm overflow-hidden p-5 sm:p-7">
            <h4 className="text-sm font-extrabold text-slate-800 tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-red-400 to-red-600" />
              {t.scamsHeading}
            </h4>

            {redFlags.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                {t.noScamsDetected}
              </div>
            ) : (
              <div className="space-y-4">
                {redFlags.map((flag, idx) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-red-50/30 border border-red-100/70 flex gap-3 items-start">
                    <div className="p-2 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-750">
                          {flag.title}
                        </span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 bg-red-100/50 text-red-800 uppercase tracking-wide rounded-md">
                          {flag.riskCategory}
                        </span>
                      </div>

                      {flag.clueText && (
                        <p className="text-[10px] sm:text-xs text-red-950 font-mono italic bg-red-100/10 p-2 rounded-xl">
                          &ldquo;{flag.clueText}&rdquo;
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        {flag.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION C: KEY CLAUSES SIMPLIFIED */}
        {(activeSegment === "all" || activeSegment === "clauses") && (
          <div className="bg-white/50 backdrop-blur-2xl rounded-[32px] border border-white shadow-sm overflow-hidden p-5 sm:p-7">
            <h4 className="text-sm font-extrabold text-slate-800 tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-indigo-600" />
              {t.clausesHeading}
            </h4>

            {keyClausesSimplified.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                {t.noClausesDetected}
              </div>
            ) : (
              <div className="space-y-4">
                {keyClausesSimplified.map((clause, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/20 border border-indigo-100/60 text-xs sm:text-sm">
                    {/* Legalese column */}
                    <div className="space-y-1 sm:space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t.originalTextLabel}</span>
                      <p className="font-mono text-xs text-slate-600 bg-white/60 border border-white p-3 rounded-xl leading-relaxed">
                        {clause.originalText}
                      </p>
                    </div>

                    {/* Simplified translation column */}
                    <div className="space-y-1 sm:space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">{t.simplifiedMeaningLabel}</span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            clause.potentialImpactRating === "hazardous"
                              ? "bg-red-150 text-red-800"
                              : clause.potentialImpactRating === "mild"
                                ? "bg-amber-150 text-amber-800"
                                : "bg-emerald-150 text-emerald-800"
                          }`}>
                            {clause.potentialImpactRating.toUpperCase()} IMPACT
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
                          {clause.simplifiedEnglish}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* IMMEDIATE DEFENSIVE STEPS */}
        {activeSegment === "all" && (
          <div className="bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/80 p-5 sm:p-7 text-xs sm:text-sm shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-800 tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-650" />
              {t.immediateAdviceHeading}
            </h4>

            <ul className="space-y-2.5">
              {actionableAdvice.map((advice, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="flex items-center justify-center p-1 rounded-full bg-indigo-200/50 text-indigo-700 shrink-0 mt-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-slate-750 font-bold leading-relaxed">
                    {advice}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </div>
  );
}
