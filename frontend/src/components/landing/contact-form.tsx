"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate async send
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center gap-4 min-h-90 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Mensagem enviada!</h3>
        <p className="text-slate-600 text-sm max-w-xs">
          Obrigado pelo contato. Nossa equipe retornará em até 24 horas.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-sm text-blue-600 hover:underline font-medium mt-2"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      <h3 className="text-xl font-bold text-slate-900 mb-6">
        Envie sua mensagem
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="c-name"
              className="text-sm font-medium text-slate-700"
            >
              Nome
            </label>
            <input
              id="c-name"
              type="text"
              required
              placeholder="Seu nome"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="c-email"
              className="text-sm font-medium text-slate-700"
            >
              E-mail
            </label>
            <input
              id="c-email"
              type="email"
              required
              placeholder="seu@email.com"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="c-subject"
            className="text-sm font-medium text-slate-700"
          >
            Assunto
          </label>
          <input
            id="c-subject"
            type="text"
            required
            placeholder="Como podemos ajudar?"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="c-message"
            className="text-sm font-medium text-slate-700"
          >
            Mensagem
          </label>
          <textarea
            id="c-message"
            rows={4}
            required
            placeholder="Descreva sua necessidade..."
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? "Enviando..." : "Enviar mensagem"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
