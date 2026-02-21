"use client";

import { motion } from "framer-motion";
import { Lightbulb, MessageCircleHeart } from "lucide-react";

export function WhySection() {
  return (
    <section id="why" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-sm font-medium mb-4">
            Ideen bak
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            Hvorfor KantinApp?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              type: "spring" as const,
              stiffness: 80,
              damping: 20,
            }}
            className="p-8 lg:p-10 rounded-3xl bg-surface-secondary border border-border"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
              <Lightbulb className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              Utfordringen
            </h3>
            <p className="text-text-secondary leading-relaxed text-lg">
              Mange elever vet ikke hva som serveres i kantinen for de kommer
              pa skolen. Kantinepersonalet har lite innsikt i hva elevene
              faktisk onsker, og det er vanskelig a planlegge menyer som treffer.
              Resultatet er ofte matsvinn og misnøyde elever.
            </p>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              type: "spring" as const,
              stiffness: 80,
              damping: 20,
              delay: 0.1,
            }}
            className="p-8 lg:p-10 rounded-3xl bg-brand-green-50 border border-brand-green/15"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-green/15 flex items-center justify-center mb-6">
              <MessageCircleHeart className="w-6 h-6 text-brand-green" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              Losningen
            </h3>
            <p className="text-text-secondary leading-relaxed text-lg">
              KantinApp gir elevene en stemme. Ved a la elevene se menyen pa
              forhand og stemme pa rettene de liker, far kantinen verdifull
              innsikt. Menyer kan tilpasses etter faktisk etterspørsel, og
              elevene foler at de blir hort. Det er bra for alle.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
