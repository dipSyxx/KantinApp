"use client";

import { motion } from "framer-motion";
import { Download, CalendarDays, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: Download,
    number: "01",
    title: "Last ned appen",
    description:
      "Last ned KantinApp gratis på mobilen din. Registrer deg med skolens e-post, og du er klar.",
  },
  {
    icon: CalendarDays,
    number: "02",
    title: "Se ukens meny",
    description:
      "Bla gjennom ukens meny sortert etter dag. Se hva som serveres, priser og allergeninformasjon.",
  },
  {
    icon: ThumbsUp,
    number: "03",
    title: "Stem på favorittene",
    description:
      "Gi din stemme på rettene du liker best. Kantinen bruker stemmene til å planlegge fremtidige menyer.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
} as const;

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 20 },
  },
};

export function HowItWorks() {
  return (
    <section id="how" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-sm font-medium mb-4">
            Slik fungerer det
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            Kom i gang på 1-2-3
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Det tar bare noen minutter å komme i gang med KantinApp
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative"
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-brand-green/15" />

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="relative text-center"
            >
              <div className="inline-flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-6">
                    <step.icon className="w-7 h-7 text-brand-green" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center shadow-md shadow-brand-green/30">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
