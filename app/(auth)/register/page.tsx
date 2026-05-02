"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, Plus, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { CyberCard }       from "@/components/cyber/CyberCard";
import { NeonInput }       from "@/components/cyber/NeonInput";
import { CyberButton }     from "@/components/cyber/CyberButton";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";
const PINK   = "#ff2d78";
const BG     = "#070c1a";

/* ═══════════════════════════════════════════════════════════════════
   FLOATING HUD PANELS
═══════════════════════════════════════════════════════════════════ */
function HudPanel({ side }: { side: "left" | "right" }) {
  const lines =
    side === "left"
      ? ["SYS://ONLINE", "ENC:AES-256", "FIREWALL:ON", "PKT:0x7A2F", "LATENCY:3ms", "UPTIME:99.9%"]
      : ["AUTH:PENDING", "NODE_ID:B7F2", "SSL:ACTIVE", "PROTO:TLS1.3", "USR:ANON", "BUILD:2.4.1"];

  return (
    <div className={`absolute top-1/2 -translate-y-1/2 hidden xl:block ${side === "left" ? "left-8" : "right-8"}`}>
      <motion.div
        initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="p-3 rounded-lg min-w-[148px]"
        style={{
          background: "rgba(2,10,24,0.70)",
          border: "1px solid rgba(0,212,255,0.16)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="text-[8px] font-bold tracking-[0.3em] uppercase mb-2.5" style={{ color: "rgba(0,212,255,0.55)" }}>
          {side === "left" ? "◈ SYSTEM" : "◈ NETWORK"}
        </div>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            className="text-[9px] font-mono mb-0.5"
            style={{ color: "rgba(0,212,255,0.38)" }}
            animate={{ opacity: [0.38, 0.75, 0.38] }}
            transition={{ duration: 2 + i * 0.35, repeat: Infinity, delay: i * 0.18 }}
          >
            {line}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HEXAGONAL AVATAR UPLOADER — double ring, icon glow, sharp hex
═══════════════════════════════════════════════════════════════════ */
function HexAvatar({ onAvatarChange }: { onAvatarChange?: (data: string | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => { const d = r.result as string; setPreview(d); onAvatarChange?.(d); };
    r.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center mb-5">
      <div
        role="button" tabIndex={0} aria-label="Upload avatar"
        className="relative w-[116px] h-[116px] cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Outer ring (faster, dashed) ── */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 116 116"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        >
          <defs>
            <filter id="outerRingGlw" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="58" cy="58" r="55"
            fill="none" stroke={`${CYAN}55`} strokeWidth="1"
            strokeDasharray="9 6" filter="url(#outerRingGlw)"
          />
          {/* Bright marker dots */}
          <circle cx="58" cy="3"   r="3.5" fill={CYAN} filter="url(#outerRingGlw)" />
          <circle cx="113" cy="58" r="2"   fill={CYAN} opacity="0.55" filter="url(#outerRingGlw)" />
          <circle cx="3"   cy="58" r="2"   fill={CYAN} opacity="0.35" filter="url(#outerRingGlw)" />
        </motion.svg>

        {/* ── Second thin ring (counter-rotating, slower) ── */}
        <motion.svg
          className="absolute"
          style={{ inset: "6px" }}
          viewBox="0 0 104 104"
          animate={{ rotate: -360 }}
          transition={{ duration: 35, ease: "linear", repeat: Infinity }}
        >
          <circle cx="52" cy="52" r="49"
            fill="none"
            stroke={`${PURPLE}45`}
            strokeWidth="0.6"
            strokeDasharray="3 9"
          />
        </motion.svg>

        {/* ── Inner pulsing ring ── */}
        <motion.div
          className="absolute rounded-full"
          style={{ inset: "12px", border: `1px solid ${CYAN}18` }}
          animate={{ opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />

        {/* ── HEXAGON ── */}
        <div className="absolute" style={{ inset: "16px" }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 84 84">
            <defs>
              <filter id="hexStrokeGlw" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <polygon
              points="42,2 80,23 80,61 42,82 4,61 4,23"
              fill="rgba(0,12,32,0.90)"
              stroke={hovered ? CYAN : `${CYAN}CC`}
              strokeWidth={hovered ? "2" : "1.5"}
              filter="url(#hexStrokeGlw)"
              style={{ transition: "stroke-width 0.2s, stroke 0.2s" }}
            />
          </svg>

          {/* Content clipped to hex shape */}
          <div
            className="absolute inset-[4px] flex items-center justify-center overflow-hidden"
            style={{ clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}
          >
            {preview ? (
              <>
                <Image src={preview} alt="Avatar" fill sizes="76px" className="object-cover" />
                <motion.div animate={{ opacity: hovered ? 1 : 0 }} className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <User className="w-7 h-7 text-white/70" />
                </motion.div>
              </>
            ) : (
              <motion.div
                animate={{
                  color: hovered ? CYAN : `${CYAN}75`,
                  filter: hovered ? `drop-shadow(0 0 10px ${CYAN})` : "drop-shadow(0 0 0px transparent)",
                }}
                transition={{ duration: 0.2 }}
              >
                <User className="w-11 h-11" />
              </motion.div>
            )}
          </div>
        </div>

        {/* ── + badge ── */}
        <motion.div
          className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full flex items-center justify-center z-20"
          style={{ background: `linear-gradient(135deg,${CYAN},${PURPLE})`, boxShadow: `0 0 14px ${CYAN}BB` }}
          animate={{ boxShadow: [`0 0 8px ${CYAN}66`, `0 0 22px ${CYAN}DD`, `0 0 8px ${CYAN}66`] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          whileHover={{ scale: 1.18, filter: `drop-shadow(0 0 8px ${CYAN})` }}
        >
          <Plus className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) load(f); }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PASSWORD STRENGTH METER
═══════════════════════════════════════════════════════════════════ */
function useStrength(pwd: string) {
  const score = [pwd.length > 5, pwd.length > 9, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^a-zA-Z0-9]/.test(pwd)].filter(Boolean).length;
  return { score, pct: score * 20, label: ["","Weak","Fair","Good","Strong","Excellent"][score], color: ["","#FF4D4D","#FF8C00","#FFD700","#7FFF00", CYAN][score] };
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading]     = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [pwVal, setPwVal]         = useState("");
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const strength = useStrength(pwVal);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd       = new FormData(e.currentTarget);
      const name     = fd.get("name")     as string;
      const email    = fd.get("email")    as string;
      const password = fd.get("password") as string;

      const res  = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, image: avatarData }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Registration failed."); return; }

      sessionStorage.setItem("_preauth", JSON.stringify({ email, password }));
      router.push(`/verify-otp?mode=verify&email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden" style={{ background: BG }}>
      <CyberBackground intensity={1} />
      <HudPanel side="left" />
      <HudPanel side="right" />

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <CyberCard>
          <div className="px-7 sm:px-8 py-8">

            {/* ── Title ── */}
            <div className="text-center mb-5">
              <h1
                className="font-black tracking-[0.28em] text-[22px] uppercase select-none"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  color: CYAN,
                  textShadow: `0 0 18px ${CYAN}EE, 0 0 40px ${CYAN}66, 0 0 80px ${CYAN}22`,
                }}
              >
                NexChat Neon
              </h1>
            </div>

            {/* ── Avatar ── */}
            <HexAvatar onAvatarChange={setAvatarData} />

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <NeonInput label="Profile Name"  icon={User} name="name"     placeholder="NeonSeeker"   autoComplete="name"         required />
              <NeonInput label="Email Address" icon={Mail} name="email"    placeholder="seek@neon.com" autoComplete="email" type="email" required />
              <div>
                <NeonInput
                  label="Password" icon={Lock} name="password" placeholder="Password"
                  type={showPw ? "text" : "password"} autoComplete="new-password" required
                  onChange={(e) => setPwVal(e.target.value)}
                  rightSlot={
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)} className="text-white/30 hover:text-white/65 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {/* Strength meter */}
                <AnimatePresence>
                  {pwVal.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 overflow-hidden">
                      <div className="h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div className="h-full rounded-full" animate={{ width: `${strength.pct}%`, background: strength.color }} transition={{ duration: 0.35 }} />
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        <div className="flex gap-1.5 items-center">
                          <Shield className="w-3 h-3" style={{ color: strength.color }} />
                          <span className="text-[9.5px] font-bold" style={{ color: strength.color }}>{strength.label}</span>
                        </div>
                        <span className="text-[9px] text-white/25">{pwVal.length} chars</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Register button */}
              <div className="pt-1">
                <CyberButton type="submit" loading={loading}>Register</CyberButton>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right,transparent,rgba(0,212,255,0.22))` }} />
                <span className="text-[9.5px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap" style={{ color: "rgba(255,255,255,0.28)" }}>or sign in with</span>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to left,transparent,rgba(0,212,255,0.22))` }} />
              </div>

              {/* Google */}
              <CyberButton variant="ghost" onClick={() => signIn("google", { callbackUrl: "/conversations" })}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </CyberButton>
            </form>

            <p className="text-center text-[11px] mt-5 font-medium" style={{ color: "rgba(255,255,255,0.28)" }}>
              Already have an account?{" "}
              <Link href="/login" className="font-bold hover:underline" style={{ color: CYAN }}>Sign In</Link>
            </p>
          </div>
        </CyberCard>
      </motion.div>
    </div>
  );
}
