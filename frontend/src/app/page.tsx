import Link from "next/link";
import {
  Package,
  Bell,
  Shield,
  Clock,
  BarChart3,
  CheckCircle2,
  Building2,
  Users,
  PackageCheck,
  ArrowRight,
  Star,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { ContactForm } from "@/components/landing/contact-form";

// ── Navigation ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#planos", label: "Planos" },
  { href: "#contato", label: "Contato" },
];

// ── Topbar ───────────────────────────────────────────────────────────────────

function Topbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Delivery<span className="text-blue-600">Manager</span>
          </span>
        </Link>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/cadastro"
            className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Contrate agora
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── App Mockup (pure CSS/Tailwind illustration) ───────────────────────────────

function AppMockup() {
  return (
    <div className="relative select-none">
      {/* Browser window */}
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
        {/* Browser chrome */}
        <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-200 text-center">
            app.deliverymanager.com.br
          </div>
        </div>

        {/* Dashboard UI */}
        <div className="flex" style={{ height: "280px" }}>
          {/* Sidebar */}
          <div className="w-14 bg-slate-900 flex flex-col items-center py-4 gap-3 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            {[BarChart3, PackageCheck, Users, Bell].map((Icon, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-slate-700" : ""}`}
              >
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 p-4 bg-slate-50 overflow-hidden">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Encomendas", value: "24", color: "text-blue-600" },
                { label: "Pendentes", value: "8", color: "text-yellow-600" },
                { label: "Retiradas", value: "16", color: "text-green-600" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm"
                >
                  <p className={`text-lg font-bold leading-none ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Package list */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Encomendas recentes
                </p>
              </div>
              {[
                {
                  apt: "Apto 101 — Bloco A",
                  status: "Aguardando",
                  badge: "bg-yellow-100 text-yellow-700",
                },
                {
                  apt: "Apto 205 — Bloco B",
                  status: "Retirado",
                  badge: "bg-green-100 text-green-700",
                },
                {
                  apt: "Apto 302 — Bloco A",
                  status: "Aguardando",
                  badge: "bg-yellow-100 text-yellow-700",
                },
                {
                  apt: "Apto 110 — Bloco C",
                  status: "Retirado",
                  badge: "bg-green-100 text-green-700",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-700">
                      {item.apt}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${item.badge}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification badge */}
      <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex items-center gap-3 w-52">
        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <Bell className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800 leading-tight">
            Morador notificado
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Apto 205 · agora</p>
        </div>
      </div>

      {/* Floating stats badge */}
      <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800 leading-tight">
            +12 hoje
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">encomendas</p>
        </div>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-28 pb-24 px-4 sm:px-6 overflow-hidden bg-linear-to-br from-white via-blue-50/40 to-indigo-50/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        {/* Text */}
        <div className="flex flex-col gap-7">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full w-fit">
            <Star className="h-3 w-3 fill-current" />A solução #1 para portarias
            de condomínio
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Chega de encomendas <span className="text-blue-600">perdidas</span>{" "}
            no seu condomínio.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed">
            Registre, notifique e rastreie todas as entregas com código de
            retirada seguro, notificações automáticas e histórico completo —
            tudo em um único painel.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Começar gratuitamente
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Ver como funciona
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {[
              "Sem taxa de setup",
              "14 dias grátis",
              "Cancele quando quiser",
            ].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div className="relative px-10 lg:px-6 py-8">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}

// ── Stats bar ────────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    { value: "500+", label: "Condomínios ativos" },
    { value: "50k+", label: "Encomendas processadas" },
    { value: "98%", label: "Satisfação dos síndicos" },
    { value: "< 2 min", label: "Tempo médio de registro" },
  ];

  return (
    <section className="py-14 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {items.map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-bold text-white">{item.value}</p>
              <p className="text-sm text-slate-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Package,
    title: "Registro instantâneo",
    description:
      "Porteiros registram encomendas em segundos com foto, código de rastreio e descrição. Tudo em um único clique, sem treinamento complexo.",
    colorClass: "bg-blue-100 text-blue-600",
  },
  {
    icon: Bell,
    title: "Notificações automáticas",
    description:
      "Moradores recebem e-mail imediatamente quando uma encomenda chega, com o código de retirada já incluso. Zero atraso.",
    colorClass: "bg-violet-100 text-violet-600",
  },
  {
    icon: Shield,
    title: "Código de retirada seguro",
    description:
      "Cada encomenda gera um código único de 6 dígitos com validade. Só quem tem o código confirma a retirada — sem confusões.",
    colorClass: "bg-green-100 text-green-600",
  },
  {
    icon: Clock,
    title: "Alertas de prazo vencido",
    description:
      "O sistema monitora automaticamente o prazo de guarda e envia alertas para moradores e síndico antes que o problema escale.",
    colorClass: "bg-orange-100 text-orange-600",
  },
  {
    icon: BarChart3,
    title: "Dashboard administrativo",
    description:
      "Visão completa em tempo real: encomendas pendentes, cadastros aguardando aprovação, métricas e histórico completo.",
    colorClass: "bg-rose-100 text-rose-600",
  },
  {
    icon: Building2,
    title: "Multi-blocos e apartamentos",
    description:
      "Suporte nativo para condomínios com múltiplos blocos, alas e centenas de apartamentos. Escala com o seu crescimento.",
    colorClass: "bg-teal-100 text-teal-600",
  },
];

function Features() {
  return (
    <section id="recursos" className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Recursos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Tudo que seu condomínio precisa
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Do registro ao histórico completo — cobrimos cada etapa do ciclo de
            vida de uma encomenda no seu condomínio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-base">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: Package,
    title: "Encomenda chega na portaria",
    description:
      "O porteiro ou zelador registra a encomenda no sistema com foto e rastreio. O processo leva menos de 2 minutos.",
  },
  {
    number: "02",
    icon: Bell,
    title: "Morador é notificado",
    description:
      "O sistema dispara automaticamente um e-mail para o morador com foto da encomenda e código exclusivo de retirada.",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "Retirada com código seguro",
    description:
      "O morador apresenta o código de 6 dígitos. O porteiro confirma e o histórico é atualizado instantaneamente.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Gestão em tempo real",
    description:
      "O síndico acompanha pendências, histórico e métricas pelo dashboard administrativo, com alertas automáticos.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Como funciona
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simples para todos os envolvidos
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Em 4 passos, toda a jornada de uma encomenda fica registrada,
            rastreada e auditável — sem papelada e sem risco de perda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Connector line — desktop only */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-9 left-[calc(50%+2.5rem)] right-[-50%] h-px bg-linear-to-r from-blue-200 to-slate-200 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center gap-4 p-2">
                  <div className="w-18 h-18 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 p-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                    Passo {step.number}
                  </span>
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Plans ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Básico",
    price: "R$ 99",
    period: "/mês",
    description: "Ideal para condomínios pequenos em fase inicial.",
    highlight: false,
    features: [
      "Até 1 bloco",
      "Até 50 apartamentos",
      "Encomendas ilimitadas",
      "Notificações por e-mail",
      "Código de retirada seguro",
      "Histórico de 6 meses",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
    href: "/cadastro",
  },
  {
    name: "Profissional",
    price: "R$ 199",
    period: "/mês",
    description: "Para condomínios com múltiplos blocos e alto volume.",
    highlight: true,
    badge: "Mais popular",
    features: [
      "Até 5 blocos",
      "Apartamentos ilimitados",
      "Encomendas ilimitadas",
      "Notificações por e-mail",
      "Código de retirada seguro",
      "Histórico ilimitado",
      "Upload de fotos",
      "Alertas de prazo vencido",
      "Dashboard com métricas",
      "Suporte prioritário",
    ],
    cta: "Começar grátis",
    href: "/cadastro",
  },
  {
    name: "Empresarial",
    price: "R$ 399",
    period: "/mês",
    description: "Para administradoras com múltiplos condomínios.",
    highlight: false,
    features: [
      "Condomínios ilimitados",
      "Blocos e aptos ilimitados",
      "Tudo do Profissional",
      "API de integração",
      "Relatórios avançados",
      "Multi-administradores",
      "SLA garantido",
      "Suporte 24/7",
      "Onboarding personalizado",
    ],
    cta: "Falar com vendas",
    href: "#contato",
  },
];

function Plans() {
  return (
    <section id="planos" className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Planos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Preço justo, sem surpresas
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Escolha o plano ideal. Todos incluem 14 dias gratuitos — sem
            necessidade de cartão de crédito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col gap-6 ${
                plan.highlight
                  ? "bg-blue-600 shadow-2xl shadow-blue-600/30 scale-105"
                  : "bg-white border border-slate-200 shadow-sm"
              }`}
            >
              {/* Popular badge */}
              {"badge" in plan && plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div>
                <p
                  className={`text-sm font-semibold mb-1 ${
                    plan.highlight ? "text-blue-200" : "text-blue-600"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span
                    className={`text-4xl font-bold ${
                      plan.highlight ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${
                      plan.highlight ? "text-blue-200" : "text-slate-500"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    plan.highlight ? "text-blue-100" : "text-slate-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        plan.highlight ? "text-blue-200" : "text-green-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlight ? "text-blue-50" : "text-slate-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`mt-2 inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-colors ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────

function Contact() {
  const contactItems = [
    { icon: Mail, label: "E-mail", value: "contato@deliverymanager.com.br" },
    { icon: Phone, label: "Telefone", value: "(11) 9 9999-9999" },
    { icon: MapPin, label: "Localização", value: "São Paulo, SP — Brasil" },
  ];

  return (
    <section id="contato" className="py-24 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
                Contato
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Fale com nossa equipe
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Tem dúvidas sobre qual plano é ideal para o seu condomínio?
                Nossa equipe está pronta para ajudar você a dar o próximo passo.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {contactItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              {[
                "98% de satisfação dos clientes",
                "Suporte em português",
                "Retorno em até 24 horas",
              ].map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form (client component) */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">
              Delivery<span className="text-blue-400">Manager</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Login
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} DeliveryManager
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="scroll-smooth">
      <Topbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Plans />
      <Contact />
      <Footer />
    </div>
  );
}
