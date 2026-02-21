"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  ThumbsUp,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Tag,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Ukemeny",
    description:
      "Se hele ukens meny sortert etter dag. Alltid oppdatert, slik at du vet hva som venter i kantinen.",
  },
  {
    icon: ThumbsUp,
    title: "Stem pa retter",
    description:
      "Gi tilbakemelding pa rettene med ett trykk. Din stemme hjelper kantinen med a velge populaere retter.",
  },
  {
    icon: ShieldCheck,
    title: "Allergeninformasjon",
    description:
      "Full oversikt over allergener i hver rett, slik at du alltid vet hva du spiser.",
  },
  {
    icon: BarChart3,
    title: "Popularitet",
    description:
      "Se hva andre elever stemmer pa. Folg med pa hvilke retter som er mest populaere.",
  },
  {
    icon: Smartphone,
    title: "Enkel a bruke",
    description:
      "Appen er designet for a vaere rask og enkel. Alt du trenger er noen fa trykk.",
  },
  {
    icon: Tag,
    title: "Pris og informasjon",
    description:
      "Se priser, beskrivelser og bilder av rettene for du bestemmer deg.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 20 },
  },
};

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-sm font-medium mb-4">
            Funksjoner
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            Alt du trenger
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            KantinApp gir deg full oversikt over kantinen og lar deg pavirke
            menyen
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group p-8 rounded-2xl bg-white border border-border hover:border-brand-green/30 shadow-sm hover:shadow-xl hover:shadow-brand-green/5 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 group-hover:bg-brand-green group-hover:shadow-lg group-hover:shadow-brand-green/30 flex items-center justify-center transition-all duration-300">
                <feature.icon className="w-6 h-6 text-brand-green group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-2 text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
