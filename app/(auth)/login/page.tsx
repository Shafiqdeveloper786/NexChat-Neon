"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { CyberCard }       from "@/components/cyber/CyberCard";
import { NeonInput }       from "@/components/cyber/NeonInput";
import { CyberButton }     from "@/components/cyber/CyberButton";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";
const BG     = "#070c1a";

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch]   = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.92) { setGlitch(true); setTimeout(() => setGlitch(false), 150); }
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd       = new FormData(e.currentTarget);
      const email    = fd.get("email")    as string;
      const password = fd.get("password") as string;

      const res  = await fetch("/api/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Login failed."); return; }

      sessionStorage.setItem("_preauth", JSON.stringify({ email, password }));
      router.push(`/verify-otp?mode=login&email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TITLE = "NexChat Neon".split("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden" style={{ background: BG }}>
      <CyberBackground intensity={1} />

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <CyberCard>
          <div className="px-7 sm:px-8 py-9">

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="font-black tracking-[0.26em] text-[22px] uppercase select-none" style={{ fontFamily: "'Orbitron',monospace" }}>
                {TITLE.map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.045, duration: 0.45 }}
                    style={{
                      display: "inline-block",
                      color: i < 7 ? CYAN : PURPLE,
                      textShadow: i < 7
                        ? `0 0 18px ${CYAN}EE, 0 0 45px ${CYAN}55`
                        : `0 0 18px ${PURPLE}EE, 0 0 45px ${PURPLE}55`,
                      filter: glitch && i % 3 === 0 ? "contrast(1.5) hue-rotate(180deg)" : "none",
                    }}
                  >
                    {ch === " " ? " " : ch}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-[9.5px] tracking-[0.25em] uppercase mt-3 font-semibold"
                style={{ color: "rgba(0,212,255,0.40)" }}
              >
                Access Your Network
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } } }}
              className="space-y-4"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                <NeonInput icon={Mail} name="email" label="Email Address" type="email" placeholder="seek@neon.com" autoComplete="email" required />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                <NeonInput
                  icon={Lock} name="password" label="Password"
                  type={showPw ? "text" : "password"} placeholder="Password"
                  autoComplete="current-password" required
                  rightSlot={
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)} className="text-white/30 hover:text-white/65 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </motion.div>

              {/* Forgot password */}
              <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="flex justify-end -mt-1">
                <Link href="/forgot-password"
                  className="text-[11px] font-semibold transition-colors"
                  style={{ color: `${CYAN}88` }}
                  onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
                  onMouseLeave={e => (e.currentTarget.style.color = `${CYAN}88`)}
                >
                  Forgot Password?
                </Link>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} className="pt-1">
                <CyberButton type="submit" loading={loading}>
                  Sign In <ArrowRight className="w-4 h-4 ml-1" />
                </CyberButton>
              </motion.div>

              {/* Divider */}
              <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right,transparent,rgba(0,212,255,0.22))` }} />
                <span className="text-[9.5px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap" style={{ color: "rgba(255,255,255,0.28)" }}>or sign in with</span>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to left,transparent,rgba(0,212,255,0.22))` }} />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                <CyberButton variant="ghost" onClick={() => signIn("google", { callbackUrl: "/conversations" })}>
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </CyberButton>
              </motion.div>
            </motion.form>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
              className="text-center text-[11px] mt-6 font-medium" style={{ color: "rgba(255,255,255,0.28)" }}>
              New to NexChat?{" "}
              <Link href="/register" className="font-bold hover:underline" style={{ color: CYAN }}>Create Account</Link>
            </motion.p>
          </div>
        </CyberCard>
      </motion.div>
    </div>
  );
}
