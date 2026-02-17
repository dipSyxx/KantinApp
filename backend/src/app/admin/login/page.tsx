"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Feil e-post eller passord");
        return;
      }

      // Check that the user has admin role
      if (data.user.role !== "CANTEEN_ADMIN" && data.user.role !== "SCHOOL_ADMIN") {
        setError("Du har ikke administratortilgang.");
        return;
      }

      // Full navigation avoids cookie propagation race on client-side transitions.
      window.location.assign("/admin");
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <span className="text-3xl">🏫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">KantinApp Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Logg inn for å administrere kantinen</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="din.epost@hkskole.no"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Ditt passord"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Logger inn..." : "Logg inn"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Kun kantine-administratorer har tilgang
        </p>
      </div>
    </div>
  );
}
