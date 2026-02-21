"use client";

import { motion } from "framer-motion";
import { School, MapPin, Phone, Mail, ExternalLink, Heart } from "lucide-react";

const schoolLinks = [
  {
    label: "Hamar Katedralskole",
    href: "https://www.hamar-katedral.vgs.no",
  },
  {
    label: "Innlandet fylkeskommune",
    href: "https://www.innlandetfylke.no",
  },
  {
    label: "Vigo.no",
    href: "https://www.vigo.no",
  },
];

const siteLinks = [
  { label: "Hjem", href: "#" },
  { label: "Funksjoner", href: "#features" },
  { label: "Slik fungerer det", href: "#how" },
  { label: "Hvorfor KantinApp?", href: "#why" },
];

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
      className="bg-brand-green-dark text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">KantinApp</div>
                <div className="text-xs text-white/60">
                  Hamar Katedralskole
                </div>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Kantineappen for Hamar Katedralskole. Se ukemenyer, stem pa
              retter og pavirk hva som serveres.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/50" />
                <span>
                  Ringgata 235, 2315 Hamar
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="w-4 h-4 shrink-0 text-white/50" />
                62 54 42 00
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="w-4 h-4 shrink-0 text-white/50" />
                post@hamar-katedral.vgs.no
              </div>
            </div>
          </div>

          {/* Site links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/90 mb-5">
              Sider
            </h3>
            <ul className="space-y-3">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* School links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/90 mb-5">
              Lenker
            </h3>
            <ul className="space-y-3">
              {schoolLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} KantinApp &mdash; Hamar
            Katedralskole
          </p>
          <p className="flex items-center gap-1.5 text-sm text-white/50">
            Laget med{" "}
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for
            elevene
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
