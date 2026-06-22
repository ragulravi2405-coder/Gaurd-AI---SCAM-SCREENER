import { ScanRecord } from "../types";
import { 
  FileSearch, Trash2, Calendar, ShieldCheck, AlertTriangle, AlertOctagon, RefreshCw 
} from "lucide-react";

interface HistoryListProps {
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  onDeleteScan: (id: string, e: any) => void;
  loading: boolean;
  onRefresh: () => void;
}

export default function HistoryList({ scans, onSelectScan, onDeleteScan, loading, onRefresh }: HistoryListProps) {
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    
    // Check if Firebase Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Header with counter and reload */}
      <div className="flex items-center justify-between gap-3 bg-white/50 backdrop-blur-xl border border-white p-4.5 rounded-[24px] shadow-sm">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full" />
            Your Safe Scan History
          </h3>
          <p className="text-xs text-slate-550 font-medium">
            Saved logs synchronized on your account profile ({scans.length} scans total)
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
          Synchronizing scan history...
        </div>
      ) : scans.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-xl border-2 border-dashed border-white rounded-[32px] p-12 text-center text-slate-500 shadow-sm">
          <FileSearch className="w-12 h-12 mx-auto text-slate-450 mb-4" />
          <p className="font-bold text-slate-800">No scanned logs detected yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
            Your scanned files, agreements, and message warning audits will be displayed here securely. Submit a clause on the New Scan tab!
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
                      Risk Index: {scan.riskScore}
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
                    {scan.title || "Document Scan Assessment"}
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
