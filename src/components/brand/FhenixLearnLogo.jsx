import React from 'react';
import { motion } from 'framer-motion';

export default function FhenixLearnLogo() {
  return (
    <div className="flex items-center gap-3 font-mono select-none">
      <div className="relative flex items-center">
        <span className="text-2xl font-bold tracking-tighter text-white">fhenix</span>
        <motion.span 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-[#0AD9DC] text-2xl leading-none ml-0.5 -mt-1"
        >
          *
        </motion.span>
      </div>
      <div className="bg-[#0AD9DC]/10 border border-[#0AD9DC]/30 rounded-full px-2 py-0.5">
        <span className="text-[#0AD9DC] text-[10px] font-bold tracking-widest uppercase">Learn</span>
      </div>
    </div>
  );
}