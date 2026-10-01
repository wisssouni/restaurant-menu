"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for 1.8s then fade out
    const timer = setTimeout(() => setFadeOut(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Once fade-out animation ends, notify parent
  function handleTransitionEnd() {
    if (fadeOut) onDone();
  }

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: fadeOut ? "none" : "all",
      }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[#ff8c00]" />

      {/* Soft radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,200,50,0.55) 0%, rgba(255,100,0,0.0) 70%)",
        }}
      />

      {/* Pulsing ambient ring */}
      <div
        className="absolute w-72 h-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,220,80,0.3) 0%, transparent 70%)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />

      {/* Logo */}
      <div
        className="relative z-10 flex flex-col items-center gap-3"
        style={{ animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        <Image
          src="/images/logo2.png"
          alt="Plato"
          width={220}
          height={220}
          className="drop-shadow-2xl"
          priority
        />
        <p
          className="text-white font-black text-3xl tracking-wide"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.18)", marginTop: "-32px" }}
        >
          Plato
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 1; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
