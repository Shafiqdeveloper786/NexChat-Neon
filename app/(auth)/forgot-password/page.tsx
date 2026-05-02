"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { CyberCard }       from "@/components/cyber/CyberCard";
import { NeonInput }       from "@/components/cyber/NeonInput";
import { CyberButton }     from "@/components/cyber/CyberButton";

const CYAN = "#00d4ff";
const BG   = "#070c1a";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      setTimeout(() => router.push(`/verify-otp?mode=reset&email=${encodeURIComponent(email)}`), 1800);
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  };

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
            <Link href="/login"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-7 transition-colors"
              style={{ color: "rgba(0,212,255,0.50)" }}
              onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,212,255,0.50)")}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>

            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,rgba(0,212,255,0.12),rgba(112,0,255,0.12))",
                  border: "1px solid rgba(0,212,255,0.30)",
                  boxShadow: "0 0 30px rgba(0,212,255,0.12)",
                }}
              >
                {sent
                  ? <ShieldCheck className="w-7 h-7" style={{ color: CYAN, filter: `drop-shadow(0 0 8px ${CYAN})` }} />
                  : <Mail       className="w-7 h-7" style={{ color: CYAN, filter: `drop-shadow(0 0 8px ${CYAN})` }} />
                }
              </motion.div>
              <h2 className="text-lg font-bold text-white mb-2">{sent ? "Code Sent!" : "Reset Password"}</h2>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                {sent
                  ? `If ${email} is registered, a reset code is on its way. Redirecting…`
                  : "Enter your email and we'll send a 6-digit code to reset your password."
                }
              </p>
            </div>

            {!sent && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <NeonInput
                  icon={Mail} name="email" label="Email Address"
                  type="email" placeholder="seek@neon.com"
                  autoComplete="email" required
                  onChange={e => setEmail(e.target.value)}
                />
                <div className="pt-1">
                  <CyberButton type="submit" loading={loading}>Send Reset Code</CyberButton>
                </div>
              </form>
            )}
          </div>
        </CyberCard>
      </motion.div>
    </div>
  );
}
