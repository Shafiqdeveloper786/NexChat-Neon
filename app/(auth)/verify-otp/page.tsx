"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { CyberCard }       from "@/components/cyber/CyberCard";
import { CyberButton }     from "@/components/cyber/CyberButton";

const CYAN = "#00d4ff";
const BG   = "#070c1a";
const OTP_LENGTH = 6;

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const email = searchParams.get("email") ?? "";
  const mode  = (searchParams.get("mode") ?? "verify") as "verify" | "login" | "reset";

  const [otp, setOtp]             = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(59);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!paste) return;
    const next = [...otp];
    paste.split("").forEach((c, idx) => { next[idx] = c; });
    setOtp(next);
    inputRefs.current[Math.min(paste.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, mode }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Verification failed."); return; }

      if (mode === "reset") {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${data.resetToken}`);
        return;
      }

      const stored = sessionStorage.getItem("_preauth");
      if (!stored) { toast.error("Session expired. Please try again."); router.push("/login"); return; }
      const { email: e2, password } = JSON.parse(stored) as { email: string; password: string };
      sessionStorage.removeItem("_preauth");

      const result = await signIn("credentials", { email: e2, password, redirect: false });
      if (result?.error) { toast.error("Could not sign in. Please log in."); router.push("/login"); return; }

      toast.success("Welcome to NexChat Neon!");
      router.push("/conversations");
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const ep = mode === "reset" ? "/api/forgot-password" : "/api/resend-otp";
      const res = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, mode }) });
      if (res.ok) { toast.success("New code sent!"); setCountdown(59); setOtp(Array(OTP_LENGTH).fill("")); inputRefs.current[0]?.focus(); }
      else toast.error("Could not resend.");
    } catch { toast.error("Network error."); }
    finally { setResending(false); }
  };

  const LABELS = { verify: "Email Verification", login: "2FA Authentication", reset: "Password Reset" };
  const HINTS  = { verify: "confirm your new account", login: "authenticate your login", reset: "reset your password" };
  const filled = otp.filter(Boolean).length;

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

            {/* Back */}
            <Link href={mode === "reset" ? "/forgot-password" : mode === "login" ? "/login" : "/register"}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-7 transition-colors"
              style={{ color: "rgba(0,212,255,0.50)" }}
              onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,212,255,0.50)")}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg,rgba(0,212,255,0.12),rgba(112,0,255,0.12))`,
                  border: `1px solid rgba(0,212,255,0.30)`,
                  boxShadow: `0 0 30px rgba(0,212,255,0.12)`,
                }}
              >
                <ShieldCheck className="w-7 h-7" style={{ color: CYAN, filter: `drop-shadow(0 0 8px ${CYAN})` }} />
              </motion.div>
              <h2 className="text-lg font-bold text-white mb-2">{LABELS[mode]}</h2>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold" style={{ color: CYAN }}>{email || "your email"}</span>{" "}
                to {HINTS[mode]}.
              </p>
            </div>

            {/* OTP boxes */}
            <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <motion.input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  autoFocus={i === 0}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 320, damping: 22 }}
                  className="text-center text-xl font-bold rounded-xl bg-white/[0.04] text-white outline-none transition-all duration-200 select-none"
                  style={{
                    width: "44px", height: "52px",
                    border: digit
                      ? `1.5px solid ${CYAN}`
                      : "1.5px solid rgba(0,212,255,0.18)",
                    boxShadow: digit ? `0 0 14px ${CYAN}55, inset 0 0 10px ${CYAN}10` : "none",
                    color: digit ? CYAN : "white",
                    textShadow: digit ? `0 0 12px ${CYAN}` : "none",
                  }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-[2px] rounded-full bg-white/[0.06] mb-6 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(to right,${CYAN},#7000ff)` }}
                animate={{ width: `${(filled / OTP_LENGTH) * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>

            <CyberButton
              loading={loading}
              disabled={filled < OTP_LENGTH}
              onClick={handleVerify}
            >
              {mode === "reset" ? "Verify & Continue" : "Verify & Sign In"}
            </CyberButton>

            {/* Resend */}
            <div className="text-center mt-5">
              {countdown > 0 ? (
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                  Resend in <span className="font-semibold" style={{ color: CYAN }}>{countdown}s</span>
                </p>
              ) : (
                <AnimatePresence>
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={handleResend} disabled={resending}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium hover:underline disabled:opacity-50"
                    style={{ color: CYAN }}
                  >
                    {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Resend Code
                  </motion.button>
                </AnimatePresence>
              )}
            </div>
          </div>
        </CyberCard>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return <Suspense><VerifyOtpContent /></Suspense>;
}
