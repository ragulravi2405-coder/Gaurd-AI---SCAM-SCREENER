import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, UploadCloud, Mic, MicOff, AlertCircle, Sparkles, Trash2, ShieldQuestion 
} from "lucide-react";
import { Language, translations } from "./translations";

interface ScannerFormProps {
  onAnalyze: (text: string, file: { data: string; mimeType: string; fileName: string } | null) => Promise<void>;
  loading: boolean;
  lang: Language;
}

export default function ScannerForm({ onAnalyze, loading, lang }: ScannerFormProps) {
  const t = translations[lang];
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ data: string; mimeType: string; fileName: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recognition, setRecognition] = useState<any | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      if (lang === "ta") rec.lang = "ta-IN";
      else if (lang === "hi") rec.lang = "hi-IN";
      else if (lang === "ml") rec.lang = "ml-IN";
      else if (lang === "te") rec.lang = "te-IN";
      else if (lang === "kn") rec.lang = "kn-IN";
      else rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInputText((prev) => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone permission denied. Enable microphone access in your browser settings.");
        } else {
          setErrorMsg(`Voice input error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [lang]);

  const handleToggleVoice = () => {
    if (!recognition) {
      setErrorMsg("Speech-to-Text is not fully supported on this browser version. Use Chrome, Safari, or high-tier mobile browsers for best results.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setErrorMsg(null);
      try {
        recognition.start();
        setIsListening(true);
      } catch (e: any) {
        console.error("Speech start failed", e);
      }
    }
  };

  // Convert files to base64
  const processSelectedFile = (file: File) => {
    setErrorMsg(null);
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("File size exceeds 15MB limit. Please provide a smaller document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1]; // strip standard base64 image prefixes
      setSelectedFile({
        data: base64Data,
        mimeType: file.type || "application/pdf",
        fileName: file.name
      });
    };
    reader.onerror = () => {
      setErrorMsg("Error parsing file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!inputText.trim() && !selectedFile) {
      setErrorMsg("Provide either written message copy, paste contract parameters, or upload a document file first.");
      return;
    }

    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    onAnalyze(inputText, selectedFile);
  };

  const loadExample = (type: "pension" | "prizes" | "credit") => {
    setErrorMsg(null);
    if (type === "pension") {
      setInputText(
        "CONGRADULATION! Ur mobile number has won a grant of $800,000 from the Universal Pensioners Fund! " +
        "To process and release your millions, you must immediately purchase a $250 Steam/iTunes gift card and " +
        "send a photocopy of the back codes to claim department email or call agent code within 12 hours!"
      );
    } else if (type === "credit") {
      setInputText(
        "DRAFT CREDIT AGREEMENT SUMMARY TERMS:\n" +
        "By signing this, user consents to an immediate setup toll of $99, combined with recurring structural management tariffs of " +
        "$39 per lunar month, auto-charged to direct debit. Unilateral termination incurs an early exit fine equivalent " +
        "to seventy percent (70%) of total credit line remaining, compiled on cumulative compounded penalty scale."
      );
    } else {
      setInputText(
        "Urgent Alert: Your Netflix account has been restricted due to payment failure! Click and verify details at: " +
        "http://netflix-recovery-portal-billing-verify.com/login now to stop cancellation of your subscription. " +
        "Provide current credit card numbers and full social security identification to unlock instantly."
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/50 backdrop-blur-2xl border border-white rounded-[32px] p-5 sm:p-7 md:p-8 shadow-xl shadow-indigo-150/30">
      
      {/* Dynamic Alert Messages */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50/60 backdrop-blur-xs border border-red-150 text-red-750 text-xs sm:text-sm mb-5 animate-in fade-in">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Document paste and voice input section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 ml-1">
              <FileText className="w-4.5 h-4.5 text-indigo-500" />
              {t.pasteLabel}
            </label>
            
            {/* Mic Dictation Trigger */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isListening 
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-white/80 text-indigo-900/80 hover:bg-white border border-white/80"
              }`}
              title={isListening ? "Stop Voice Mode" : "Start Voice/Dictation Input"}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>{t.speakMessageActive}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-pink-500" />
                  <span>{t.speakMessage}</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholderText}
              className="w-full bg-white/40 backdrop-blur-xs border border-indigo-100 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white/80 focus:ring-2 focus:ring-indigo-150 transition-all font-sans placeholder-slate-400 shadow-2xs"
            />
            {isListening && (
              <div className="absolute bottom-3 left-4 flex items-center gap-2 text-red-550 text-xs font-bold bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-red-100 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                {t.speakMessageActive}
              </div>
            )}
          </div>
        </div>

        {/* File Drag-and-Drop Uploader */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-800 ml-1">
            {t.uploadLabel}
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx,image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-sky-500 bg-white/80" 
                  : "border-indigo-200/80 hover:border-indigo-400/80 bg-white/20 hover:bg-white/45 shadow-2xs"
              }`}
            >
              <UploadCloud className="w-10 h-10 text-indigo-400 mb-2.5 animate-bounce" />
              <p className="text-xs sm:text-sm font-bold text-slate-750">{t.dragDropText}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{t.fileLimitText}</p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white">
              <div className="flex items-center gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-indigo-100 text-indigo-500 shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-850 truncate max-w-[200px] sm:max-w-md">
                    {selectedFile.fileName}
                  </p>
                  <p className="text-[10px] text-slate-550 font-medium">{t.fileAttachedText}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-white cursor-pointer transition-colors"
                title={t.removeFile}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Button & Demo Examples */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">
              {lang === "ta" ? "உடனடி டெமோவைச் சோதிக்கவும்:" : 
               lang === "hi" ? "त्वरित डेमो आज़माएं:" : 
               lang === "ml" ? "ഉടൻ പരീക്ഷിച്ചു നോക്കൂ:" : 
               lang === "te" ? "తక్షణ డెమో చూడండి:" : 
               lang === "kn" ? "ತಕ್ಷಣದ ಡೆಮೊ ಪರಿಶೀಲಿಸಿ:" : 
               "TRY AN INSTANT DEMO CASE:"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => loadExample("pension")}
                className="text-[10.5px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
              >
                {lang === "ta" ? "ஓய்வூதிய மோசடி உரை" : lang === "hi" ? "पेंशन घोटाला पाठ" : lang === "ml" ? "പെൻഷൻ തട്ടിപ്പ്" : lang === "te" ? "పెన్షన్ మోసం" : lang === "kn" ? "ಪಿಂಚಣಿ ವಂಚನೆ" : "Pension scam text"}
              </button>
              <button
                type="button"
                onClick={() => loadExample("credit")}
                className="text-[10.5px] font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
              >
                {lang === "ta" ? "கடன் ஒப்பந்தம்" : lang === "hi" ? "ऋण अनुबंध" : lang === "ml" ? "വായ്പ കരാർ" : lang === "te" ? "రుణ ఒప్పందం" : lang === "kn" ? "ಸಾಲದ ಒಪ್ಪಂದ" : "Loan legalese"}
              </button>
              <button
                type="button"
                onClick={() => loadExample("prizes")}
                className="text-[10.5px] font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                {lang === "ta" ? "மோசடி எச்சரிக்கை" : lang === "hi" ? "धोखाधड़ी चेतावनी" : lang === "ml" ? "തട്ടിപ്പ് മുന്നറിയിപ്പ്" : lang === "te" ? "మోసం హెచ్చరిక" : lang === "kn" ? "ವಂಚನೆ ಎಚ್ಚರಿಕೆ" : "Phishing alert"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-w-[160px] bg-linear-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4.5 h-4.5" />
            {loading ? t.neuralScanning : t.startScanBtn}
          </button>
        </div>

      </form>
    </div>
  );
}
