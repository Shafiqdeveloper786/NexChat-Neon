"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { CyberCard }       from "@/components/cyber/CyberCard";
import { CyberButton }     from "@/components/cyber/CyberButton";

const CYAN = "#00d4ff";
const BG   = "#070c1a";

function useStrength(pwd: string) {
  const s = [pwd.length>5, pwd.length>9, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^a-zA-Z0-9]/.test(pwd)].filter(Boolean).length;
  return { pct: s*20, label: ["","Weak","Fair","Good","Strong","Excellent"][s], color: ["","#FF4D4D","#FF8C00","#FFD700","#7FFF00",CYAN][s] };
}

function ResetPasswordContent() {
  const params     = useSearchParams();
  const router     = useRouter();
  const email      = params.get("email") ?? "";
  const resetToken = params.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const strength = useStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    if (password.length < 8)  { toast.error("Minimum 8 characters."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Reset failed."); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2200);
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  };

  const inputCls = "relative z-10 w-full pl-10 pr-10 py-3 rounded-xl text-[13px] text-white outline-none transition-all duration-200 placeholder:text-white/20";
  const inputStyle = (focused: boolean, err?: boolean) => ({
    background: focused ? "rgba(0,212,255,0.04)" : "rgba(0,14,34,0.62)",
    border: err ? "1px solid rgba(255,77,77,0.55)"
      : focused ? "1px solid rgba(34,211,238,0.65)"
      : "1px solid rgba(0,212,255,0.20)",
    boxShadow: focused && !err ? `0 0 0 1px ${CYAN}18, 0 0 22px ${CYAN}12` : "none",
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden" style={{ background: BG }}>
      <CyberBackground intensity={1} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[380px]"
      >
        <CyberCard>
          <div className="px-7 sm:px-8 py-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.12),rgba(112,0,255,0.12))", border: "1px solid rgba(0,212,255,0.30)", boxShadow: "0 0 30px rgba(0,212,255,0.12)" }}
              >
                {done
                  ? <CheckCircle2 className="w-7 h-7" style={{ color: CYAN, filter: `drop-shadow(0 0 8px ${CYAN})` }} />
                  : <Lock        className="w-7 h-7" style={{ color: CYAN, filter: `drop-shadow(0 0 8px ${CYAN})` }} />
                }
              </motion.div>
              <h2 className="text-lg font-bold text-white mb-2">{done ? "Password Updated!" : "New Password"}</h2>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                {done ? "Password reset. Redirecting to login…" : "Choose a strong password for your account."}
              </p>
            </div>

            {!done && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-[10.5px] font-medium mb-1.5 tracking-[0.07em]" style={{ color: "rgba(0,212,255,0.52)" }}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgba(255,255,255,0.30)" }} />
                    <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required className={inputCls} style={inputStyle(false)} />
                    <button type="button" tabIndex={-1} onClick={()=>setShowPw(p=>!p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/65 transition-colors">
                      {showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                  <AnimatePresence>
                    {password.length > 0 && (
                      <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:"auto" }} exit={{ opacity:0,height:0 }} className="mt-2 overflow-hidden">
                        <div className="h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div className="h-full rounded-full" animate={{ width:`${strength.pct}%`, background:strength.color }} transition={{ duration:0.35 }} />
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                          <div className="flex gap-1.5 items-center"><Shield className="w-3 h-3" style={{color:strength.color}}/><span className="text-[9.5px] font-bold" style={{color:strength.color}}>{strength.label}</span></div>
                          <span className="text-[9px] text-white/25">{password.length} chars</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-[10.5px] font-medium mb-1.5 tracking-[0.07em]" style={{ color: "rgba(0,212,255,0.52)" }}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgba(255,255,255,0.30)" }} />
                    <input type={showCf?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm Password" required className={inputCls} style={inputStyle(false, confirm.length>0 && confirm!==password)} />
                    <button type="button" tabIndex={-1} onClick={()=>setShowCf(p=>!p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/65 transition-colors">
                      {showCf?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                  {confirm.length>0 && confirm!==password && (
                    <p className="text-[10px] text-red-400/80 mt-1">Passwords do not match.</p>
                  )}
                </div>

                <div className="pt-1">
                  <CyberButton type="submit" loading={loading} disabled={password!==confirm||password.length<8}>
                    Reset Password
                  </CyberButton>
                </div>
                <p className="text-center text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <Link href="/login" className="hover:underline" style={{ color: CYAN }}>Back to Login</Link>
                </p>
              </form>
            )}
          </div>
        </CyberCard>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordContent /></Suspense>;
}
