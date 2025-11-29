import React from 'react';
import { motion } from 'framer-motion';

export default function FhenixLearnLogo() {
  return (
    <div className="flex items-center gap-2 select-none font-display">
        <span className="text-2xl font-bold text-slate-300">(</span>
        <div className="relative flex items-center">
            <span className="text-2xl font-bold tracking-tight text-white">fhenix</span>
            <motion.span 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-[#0AD9DC] text-2xl leading-none ml-0.5 -mt-2"
            >
            *
            </motion.span>
        </div>
        <span className="text-2xl font-bold text-slate-300">)</span>
    </div>
  );
}