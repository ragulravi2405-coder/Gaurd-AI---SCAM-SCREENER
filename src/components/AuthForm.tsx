import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { auth } from "../firebase";
import { Shield, Mail, Lock, User, AlertCircle, X, CheckCircle } from "lucide-react";

interface AuthFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthForm({ onClose, onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp && !displayName.trim()) {
      setError("Please provide a name.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Register flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        setSuccessMsg("Account created successfully!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        // Login flow
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMsg("Logged in successfully!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password combination.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      // Use a consistent demo account for direct preview testing
      await signInWithEmailAndPassword(auth, "consumer.rights.tester@gmail.com", "Tester123!");
      setSuccessMsg("Logged in with Demo Account!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      // If demo user doesn't exist yet, we can create it dynamically!
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/invalid-email" || err.code === "auth/email-already-in-use") {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, "consumer.rights.tester@gmail.com", "Tester123!");
          await updateProfile(userCredential.user, {
            displayName: "Guest Inspector"
          });
          setSuccessMsg("Created and logged into Demo Account!");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        } catch (innerErr: any) {
          setError("Failed to initialize tester account, please sign up standard: " + innerErr.message);
        }
      } else {
        setError("Demo sign in failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white/65 backdrop-blur-2xl rounded-[32px] border border-white shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3.5 bg-white/80 border border-white text-slate-800 rounded-2xl shadow-sm mb-3">
            <Shield className="w-6 h-6 text-fuchsia-500" />
          </div>
          <h2 className="text-xl font-bold text-indigo-950">
            {isSignUp ? "Create Free Account" : "Access Your Workspace"}
          </h2>
          <p className="text-xs text-slate-550 mt-1 max-w-[280px] font-medium">
            Log in to automatically save scan history and keep your processed files protected.
          </p>
        </div>

        {/* Error or Success Toast */}
        {error && (
          <div className="flex items-start gap-2 bg-red-55/20 backdrop-blur-xs text-red-855 text-xs p-3 rounded-2xl border border-red-150 mb-4 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-55/20 backdrop-blur-xs text-emerald-855 text-xs p-3 rounded-2xl border border-emerald-150 mb-4">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Your Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/40 border border-indigo-100 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white/80 focus:ring-2 focus:ring-indigo-150 transition-all shadow-2xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/40 border border-indigo-100 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white/80 focus:ring-2 focus:ring-indigo-150 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-white/40 border border-indigo-100 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white/80 focus:ring-2 focus:ring-indigo-150 transition-all shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-sky-500 via-indigo-500 to-fuchsia-500 hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Secure Log In"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200/40" />
          </div>
          <div className="relative flex justify-center text-[10px] text-slate-400">
            <span className="bg-white/80 backdrop-blur-md px-3 py-0.5 rounded-full border border-indigo-150/40 font-bold uppercase tracking-wider">OR PLAYGROUND QUICK TEST</span>
          </div>
        </div>

        {/* Demo Account Bypass Button */}
        <button
          onClick={handleDemoSignIn}
          disabled={loading}
          className="w-full bg-white/80 border border-white text-indigo-900 hover:bg-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Shield className="w-4 h-4 text-fuchsia-550 animate-pulse" />
          Test immediately with Demo credentials
        </button>

        <div className="mt-5 text-center text-xs text-slate-500 font-medium">
          {isSignUp ? "Already have an account? " : "New to ShieldScreener? "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
