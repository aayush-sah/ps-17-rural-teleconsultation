"use client";
import React from "react";
import { motion } from "framer-motion";

export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#f8fafc]">
      {/* Soft floating mesh gradient orbs - Friendly & Welcoming Colors */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1], 
          x: [0, 40, 0], 
          y: [0, -40, 0] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply blur-[100px]" 
        style={{ background: "rgba(199, 210, 254, 0.6)" }} /* Soft Indigo */
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          x: [0, -30, 0], 
          y: [0, 50, 0] 
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[-10%] w-[50vw] h-[60vw] rounded-full mix-blend-multiply blur-[100px]" 
        style={{ background: "rgba(167, 243, 208, 0.5)" }} /* Soft Emerald */
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1], 
          x: [0, 50, 0], 
          y: [0, -30, 0] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[50vw] rounded-full mix-blend-multiply blur-[100px]" 
        style={{ background: "rgba(24bcff, 0.15)" }} /* Soft Blue */
      />

      {/* Futuristic Vector Grid Overlay (very light to avoid confusion) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] text-indigo-900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tech-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-grid)" />
      </svg>

      {/* Large rotating vector orbit loops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-60">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute w-[200vw] h-[200vw] sm:w-[120vw] sm:h-[120vw] rounded-full border-[2px] border-indigo-400/10"
          style={{ borderStyle: "dashed" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 250, repeat: Infinity, ease: "linear" }}
          className="absolute w-[160vw] h-[160vw] sm:w-[90vw] sm:h-[90vw] rounded-full border-[1px] border-emerald-500/10"
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[100vw] h-[100vw] sm:w-[50vw] sm:h-[50vw] rounded-full border-[6px] border-indigo-300/20 mix-blend-overlay"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0, 0.2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-[130vw] h-[130vw] sm:w-[70vw] sm:h-[70vw] rounded-full border-[1px] border-blue-400/30"
        />
      </div>
    </div>
  );
}
