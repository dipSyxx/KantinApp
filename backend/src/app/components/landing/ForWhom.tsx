"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  ChefHat,
  CalendarDays,
  ThumbsUp,
  ShieldAlert,
  Bell,
  BarChart3,
  Utensils,
  Leaf,
  TrendingUp,
} from "lucide-react";

const audiences = [
  {
    icon: GraduationCap,
    title: "For elever",
    description: "Se hva som serveres og gjor kantinen bedre",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    points: [
      { icon: CalendarDays, text: "Se menyen for hele uken pa forhand" },
      { icon: ThumbsUp, text: "Stem pa rettene du liker best" },
      { icon: ShieldAlert, text: "Full oversikt over allergener" },
      { icon: Bell, text: "Vit hva som serveres for du kommer" },
    ],
  },
  {
    icon: ChefHat,
    title: "For kantinen",
    description: "Fa innsikt og planlegg bedre menyer",
    color: "bg-brand-green-50 border-brand-green/15",
    iconBg: "bg-brand-green/15",
    iconColor: "text-brand-green",
    points: [
      { icon: BarChart3, text: "Se hvilke retter som er mest populaere" },
      { icon: Utensils, text: "Planlegg menyer basert pa tilbakemeldinger" },
      { icon: Leaf, text: "Reduser matsvinn med bedre planlegging" },
      { icon: TrendingUp, text: "Folg trender og preferanser over tid" },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
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

export function ForWhom() {
  return (
    <section className="py-24 lg:py-32 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-sm font-medium mb-4">
            For hvem?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            Noe for alle
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            KantinApp er laget for bade elever og kantinepersonalet
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {audiences.map((audience) => (
            <motion.div
              key={audience.title}
              variants={cardVariants}
              className={`p-8 lg:p-10 rounded-3xl border ${audience.color}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl ${audience.iconBg} flex items-center justify-center`}
                >
                  <audience.icon
                    className={`w-7 h-7 ${audience.iconColor}`}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text-primary">
                    {audience.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {audience.description}
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {audience.points.map((point) => (
                  <li key={point.text} className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${audience.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <point.icon
                        className={`w-4 h-4 ${audience.iconColor}`}
                      />
                    </div>
                    <span className="text-text-primary font-medium">
                      {point.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
