"use client";

import { motion } from "framer-motion";
import { ArrowDown, Heart } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 20 },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-brand-green-50 via-white to-brand-green-100" />

      <div className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full bg-brand-green/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-brand-green/8 blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#1B7A3D 1px, transparent 1px), linear-gradient(90deg, #1B7A3D 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 text-brand-green text-sm font-medium mb-8"
          >
            <Heart className="w-4 h-4" />
            <span>Hamar Katedralskole</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary"
          >
            Velkommen til{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-green to-brand-green-light">
              KantinApp
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl"
          >
            Se ukens meny, stem pa rettene du liker best, og hjelp kantinen
            med a lage mat du faktisk vil ha. En app laget for elevene ved
            Hamar Katedralskole.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#features"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-brand-green hover:bg-brand-green-dark shadow-xl shadow-brand-green/25 hover:shadow-brand-green/40 transition-all hover:-translate-y-0.5"
            >
              Utforsk funksjoner
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-brand-green bg-white border-2 border-brand-green/20 hover:border-brand-green/40 hover:bg-brand-green-50 transition-all hover:-translate-y-0.5"
            >
              Slik fungerer det
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
