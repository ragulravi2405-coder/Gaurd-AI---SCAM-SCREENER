export interface HiddenCharge {
  chargeName: string;
  extractedQuote: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface RedFlag {
  title: string;
  clueText: string;
  explanation: string;
  riskCategory: string;
}

export interface SimplifiedClause {
  originalText: string;
  simplifiedEnglish: string;
  potentialImpactRating: "mild" | "hazardous" | "neutral";
}

export interface AnalysisResult {
  riskScore: number;
  verdict: "SAFE" | "CAUTION" | "HIGH_RISK";
  riskAssessment: string;
  hiddenCharges: HiddenCharge[];
  redFlags: RedFlag[];
  keyClausesSimplified: SimplifiedClause[];
  actionableAdvice: string[];
}

export interface ScanRecord extends AnalysisResult {
  id: string;
  userId: string;
  title: string;
  timestamp: any; // Firestore Timestamp
  textUsed?: string;
  fileName?: string;
}
