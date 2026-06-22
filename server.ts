import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Extend payload sizes to handle base64 documents (PDFs, images) gracefully
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize the Gemini SDK
  const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JojCC_yeIRLLoewbU-E3knNykecggIO2VX0hvgIBHE4A";
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Scam & Hidden Fees Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text, file } = req.body;

      if (!text && !file) {
        return res.status(400).json({ error: "Please provide text content or upload a document." });
      }

      const contents: any[] = [];

      // Create detailed system prompt for analyzing documents/texts
      const systemInstruction = 
        "You are an elite Consumer Protection Lawyer and Scam Investigator specializing in scanning agreements, messages, ads, bills, and legal files for hidden predatory clauses, surprise fees, subscription traps, malicious patterns, or scams.\n" +
        "You translate complicated legal terms or misleading text into simple, crystal-clear explanation, highlighting warning segments.\n" +
        "Analyze the provided text and document attachments thoroughly, evaluate risk transparently, identify surprise fees and warning clues, simplify complex statements, and give 3-5 defensive recommendations.";

      let userPrompt = "Identify hidden charges, predatory terms, active traps, and fraudulent characteristics from the user's uploaded input.";
      if (text) {
        userPrompt += `\n\n[USER SUBMITTED TEXT OR MESSAGE]:\n${text}`;
      }

      contents.push(userPrompt);

      if (file && file.data) {
        contents.push({
          inlineData: {
            data: file.data, // base64 encoded string
            mimeType: file.mimeType || "application/pdf"
          }
        });
      }

      // Query Gemini 3.5 Flash for the structured analysis
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: {
                type: Type.INTEGER,
                description: "Risk score from 0 (fully safe) to 100 (severe threat/scam)."
              },
              verdict: {
                type: Type.STRING,
                description: "Verdict for the general risk tier. Must be exactly 'SAFE' or 'CAUTION' or 'HIGH_RISK'."
              },
              riskAssessment: {
                type: Type.STRING,
                description: "A clear, compelling 1-to-2 sentence overall summary of why this verdict has been selected."
              },
              hiddenCharges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    chargeName: { type: Type.STRING, description: "Title or category of this hidden of unexpected cost." },
                    extractedQuote: { type: Type.STRING, description: "A quote or snippet from the scanned text that references this fee or penalty." },
                    explanation: { type: Type.STRING, description: "A direct plain-English description of what this actually costs the user." },
                    severity: { type: Type.STRING, description: "Level of surprise or threat: 'low', 'medium', or 'high'." }
                  },
                  required: ["chargeName", "explanation", "severity"]
                },
                description: "Any automatic subscription renewals, sign-up penalties, processing margins, exit fees, or service tariffs."
              },
              redFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "A clear title for the warning sign (e.g., Urgency Trap, Phishing Link)." },
                    clueText: { type: Type.STRING, description: "The phrase or layout pattern triggering the alert." },
                    explanation: { type: Type.STRING, description: "Detailed look at why this typical technique scam is deceptive or predatory." },
                    riskCategory: { type: Type.STRING, description: "Theme: payment evasion, pre-payment scam, identity extraction, subscription loop, etc." }
                  },
                  required: ["title", "explanation", "riskCategory"]
                },
                description: "Indicators of fraud, fishing, psychological triggers of extreme fear/greed, or coercive language."
              },
              keyClausesSimplified: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalText: { type: Type.STRING, description: "Dense, complicated legal/commercial terminology from the document." },
                    simplifiedEnglish: { type: Type.STRING, description: "Exact same obligation translated to clear everyday terms." },
                    potentialImpactRating: { type: Type.STRING, description: "Risk potential for the user: 'mild', 'hazardous', or 'neutral'." }
                  },
                  required: ["originalText", "simplifiedEnglish", "potentialImpactRating"]
                },
                description: "Conversion of tricky legalese sentences into easily-managed normal English clauses."
              },
              actionableAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific immediate steps the user should execute to secure their safety."
              }
            },
            required: [
              "riskScore",
              "verdict",
              "riskAssessment",
              "hiddenCharges",
              "redFlags",
              "keyClausesSimplified",
              "actionableAdvice"
            ]
          }
        }
      });

      const analysisRawText = response.text;
      if (!analysisRawText) {
        throw new Error("No response output returned from the Gemini AI model.");
      }

      const result = JSON.parse(analysisRawText.trim());
      res.json(result);

    } catch (error: any) {
      console.error("Analysis Error details:", error);
      res.status(500).json({
        error: "Failed to scan document due to server configuration or load issues.",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Vite middleware integration for full-stack build/dev system compatibility
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((error) => {
  console.error("Critical server boot error:", error);
});
