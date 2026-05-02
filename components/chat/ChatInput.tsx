"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Smile, Send, X, Loader2, ImageIcon } from "lucide-react";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";
const PINK   = "#ff2d78";

const EMOJIS = [
  "😀","😂","😍","🥰","😎","🤔","😢","😡","🥳","😇",
  "👍","👎","❤️","🔥","🎉","👏","💪","✨","🚀","💯",
  "🌟","⚡","🎮","💻","🤖","👾","🌈","🍕","☕","🎵",
];

type SendPayload = { body?: string; image?: string; fileUrl?: string; fileType?: string };

interface Attach {
  preview: string;
  base64:  string;
  type:    "image" | "pdf";
  name?:   string;
}

/* ── Upload to Cloudinary via our API route ─────────────────────── */
async function uploadFile(base64: string): Promise<string | null> {
  try {
    const res = await fetch("/api/upload", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ file: base64 }),
    });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url as string;
  } catch {
    return null;
  }
}

interface Props {
  onSend?:          (payload: SendPayload) => void;
  conversationId?:  string;
}

export default function ChatInput({ onSend, conversationId }: Props) {
  const [text, setText]           = useState("");
  const [sending, setSending]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [focused, setFocused]     = useState(false);
  const [showEmoji, setEmoji]     = useState(false);
  const [attachment, setAttach]   = useState<Attach | null>(null);

  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const typingRef       = useRef(false);   // are we currently "typing"?
  const typingTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fire typing event to server (which forwards via Pusher) ── */
  const triggerTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return;
    fetch(`/api/conversations/${conversationId}/typing`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isTyping }),
    }).catch(() => {/* non-critical */});
  }, [conversationId]);

  /* ── Stop-typing after 3 s silence ── */
  const scheduleStopTyping = useCallback(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (typingRef.current) {
        typingRef.current = false;
        triggerTyping(false);
      }
    }, 3000);
  }, [triggerTyping]);

  const hasContent = text.trim().length > 0 || !!attachment;
  const isBusy     = sending || uploading;

  /* ── Clear immediately on send for instant UX ── */
  const clearInput = () => {
    setText("");
    setEmoji(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  /* ── Main send handler ── */
  const handleSend = async () => {
    if (!hasContent || isBusy) return;

    // Capture before clearing
    const body          = text.trim();
    const capturedAttach = attachment;

    // ✅ Clear text immediately — user sees empty input right away
    clearInput();
    setSending(true);

    // Stop typing indicator immediately on send
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (typingRef.current) { typingRef.current = false; triggerTyping(false); }

    try {
      const payload: SendPayload = {};
      if (body) payload.body = body;

      if (capturedAttach) {
        setUploading(true);
        setAttach(null); // Remove preview immediately

        // Upload to Cloudinary → get a small URL (not raw base64)
        // This is critical: Pusher has a 10 KB event limit.
        // Sending base64 directly would be silently dropped; a URL is ~100 chars.
        const url = await uploadFile(capturedAttach.base64);
        setUploading(false);

        if (url) {
          if (capturedAttach.type === "image") {
            payload.image = url;
          } else {
            payload.fileUrl  = url;
            payload.fileType = "pdf";
          }
        }
      }

      await onSend?.(payload);
    } catch (err) {
      console.error("[ChatInput]", err);
    } finally {
      setSending(false);
      setUploading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;

    /* ── Typing indicator ── */
    if (e.target.value.trim()) {
      if (!typingRef.current) {
        typingRef.current = true;
        triggerTyping(true);
      }
      scheduleStopTyping();
    } else {
      // Field cleared — stop typing immediately
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (typingRef.current) {
        typingRef.current = false;
        triggerTyping(false);
      }
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large (max 5 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const isImg  = file.type.startsWith("image/");
      setAttach({
        preview: isImg ? base64 : file.name,
        base64,
        type: isImg ? "image" : "pdf",
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const insertEmoji = (emoji: string) => {
    setText(p => p + emoji);
    setEmoji(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-2 relative">

      {/* ── Emoji picker ── */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-full mb-2 left-4 rounded-2xl p-3 grid grid-cols-10 gap-1.5 z-50"
            style={{
              background:     "rgba(4,10,24,0.97)",
              border:         "1px solid rgba(0,212,255,0.22)",
              backdropFilter: "blur(30px)",
              boxShadow:      `0 0 40px rgba(0,0,0,0.6), 0 0 20px ${CYAN}10`,
            }}
          >
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => insertEmoji(e)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-lg hover:bg-white/10 transition-colors"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Attachment preview (shown before send; hides silently on send) ── */}
      <AnimatePresence>
        {attachment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 overflow-hidden"
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.16)" }}
            >
              {attachment.type === "image" ? (
                <>
                  <img src={attachment.preview} alt="preview"
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <span className="text-xs text-white/55 flex-1 truncate">Image attached</span>
                  <button onClick={() => setAttach(null)}
                    className="text-white/30 hover:text-white/60 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(255,45,120,0.15)", color: PINK }}>
                    PDF
                  </div>
                  <span className="text-xs text-white/55 flex-1 truncate">{attachment.name}</span>
                  <button onClick={() => setAttach(null)}
                    className="text-white/30 hover:text-white/60 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input bar ── */}
      <motion.div
        animate={{
          borderColor: focused ? "rgba(34,211,238,0.42)" : "rgba(0,212,255,0.12)",
          boxShadow:   focused
            ? `0 0 0 1px rgba(0,212,255,0.14), 0 0 28px rgba(0,212,255,0.09), inset 0 1px 0 rgba(0,212,255,0.10)`
            : `0 0 0 1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(0,212,255,0.05)`,
        }}
        transition={{ duration: 0.18 }}
        className="rounded-2xl px-3 py-2.5 flex items-end gap-2 border"
        style={{
          background:           "rgba(4,10,24,0.90)",
          backdropFilter:       "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
        }}
      >
        {/* ── Left icons ── */}
        <div className="flex items-center gap-0.5 pb-1.5">
          <motion.button
            whileHover={{ color: CYAN, filter: `drop-shadow(0 0 4px ${CYAN}88)` }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ color: "rgba(255,255,255,0.28)" }}
            title="Attach file or image"
          >
            <Paperclip className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ color: CYAN, filter: `drop-shadow(0 0 4px ${CYAN}88)` }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setEmoji(p => !p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: showEmoji ? CYAN : "rgba(255,255,255,0.28)" }}
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ color: CYAN, filter: `drop-shadow(0 0 4px ${CYAN}88)` }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ color: "rgba(255,255,255,0.28)" }}
            title="Send image"
          >
            <ImageIcon className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFile}
        />

        {/* ── Textarea ── */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type a message…"
          disabled={isBusy}
          className="flex-1 bg-transparent text-sm text-white outline-none resize-none leading-relaxed py-1.5 max-h-[120px] overflow-y-auto placeholder:text-white/22 disabled:opacity-60"
          style={{ minHeight: "36px", caretColor: CYAN }}
        />

        {/* ── Send button ── */}
        <AnimatePresence mode="wait">
          <motion.button
            key={hasContent ? "active" : "idle"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            whileHover={hasContent && !isBusy
              ? { scale: 1.08, boxShadow: `0 0 20px ${CYAN}88, 0 0 40px ${PURPLE}44` }
              : {}}
            whileTap={hasContent && !isBusy ? { scale: 0.92 } : {}}
            onClick={handleSend}
            disabled={!hasContent || isBusy}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 transition-all duration-200"
            style={hasContent && !isBusy ? {
              background: `linear-gradient(135deg,${CYAN},${PURPLE})`,
              boxShadow:  `0 0 14px ${CYAN}55, 0 0 28px ${PURPLE}33`,
            } : {
              background: "rgba(255,255,255,0.06)",
              opacity:    0.40,
              cursor:     "not-allowed",
            }}
          >
            {isBusy
              ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#050505" }} />
              : <Send
                  className="w-4 h-4"
                  style={{ color: hasContent ? "#050505" : "rgba(255,255,255,0.40)" }}
                  fill={hasContent ? "#050505" : "none"}
                  strokeWidth={hasContent ? 0 : 2}
                />
            }
          </motion.button>
        </AnimatePresence>
      </motion.div>

      {/* ── Bottom media hint icons ── */}
      <div className="flex items-center justify-center gap-6 mt-2">
        {["🎤", "📹", "📞"].map((icon, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="text-base opacity-25 hover:opacity-60 transition-opacity"
          >
            {icon}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
