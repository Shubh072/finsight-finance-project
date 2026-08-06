import React from "react";
import { Sparkles, ArrowRight, Check, CheckCircle2, TrendingUp, Shield, HelpCircle, Star, Users, ArrowUpRight, Zap, RefreshCw } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSelectView: (v: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSelectView }) => {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      title: "Expense Intelligence",
      desc: "Automatically categorize transactions, detect patterns, and optimize monthly consumption curves.",
      icon: TrendingUp,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Dynamic Budgeting",
      desc: "Configure agile velocity budgets that adjust in real-time to your discretionary burn rate.",
      icon: Zap,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Wealth & Portfolio Ledger",
      desc: "Aggregate equities, crypto assets, and fixed income in a single ultra-responsive terminal.",
      icon: Shield,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "AI Risk Calibration",
      desc: "Our neural insights layer evaluates portfolio variance against risk-tolerance vectors.",
      icon: Sparkles,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  const pricingTiers = [
    {
      name: "Standard Core",
      price: "$0",
      period: "forever free",
      desc: "Essential ledger utilities for individual wealth tracking.",
      features: [
        "Simulated transaction engine",
        "Up to 3 active milestones",
        "Basic static portfolio aggregation",
        "Weekly email summaries",
      ],
      cta: "Get Started",
      highlight: false,
    },
    {
      name: "Pro Intelligence",
      price: "$19",
      period: "per month",
      desc: "Advanced neural auditing and predictive analytics suite.",
      features: [
        "Unrestricted transaction ledger",
        "Continuous AI financial health score",
        "Unlimited custom milestones",
        "Algorithmic portfolio trade simulation",
        "Priority 24/7 client response desk",
      ],
      cta: "Activate 14-Day Free Trial",
      highlight: true,
    },
    {
      name: "Enterprise Wealth",
      price: "$149",
      period: "per month",
      desc: "Bespoke capital safety and multi-account coordination.",
      features: [
        "Everything in Pro Intelligence",
        "Dedicated wealth planner desk",
        "Multi-factor compliance reports",
        "Offline backup protocol access",
        "Unlimited connected API feeds",
      ],
      cta: "Request Consultation",
      highlight: false,
    },
  ];

  const reviews = [
    {
      quote: "FinSight completely recalibrated my asset distribution logic. The simulated trades are incredibly informative before allocating real capital.",
      author: "Marcus Chen",
      role: "Capital Partner, Peak Venture LLC",
    },
    {
      quote: "The interface is beautiful and responsive. Having AI insights analyze my monthly discretionary burn helps keep my long-term targets aligned.",
      author: "Sarah Jenkins",
      role: "Senior Engineering Manager",
    },
  ];

  const faqs = [
    {
      q: "How does the AI Assistant analyze my cash flow?",
      a: "FinSight processes your transactional metadata to evaluate your recurring income, discretionary burn velocity, and committed deposits against simulated asset volatility. It operates completely server-side via Gemini's premium LLM.",
    },
    {
      q: "Can I simulate live stock and crypto trades?",
      a: "Yes. Our Portfolio module enables zero-liability trade execution. You can purchase or sell equities and digital assets with instant cost-average updates and gain/loss tracking.",
    },
    {
      q: "Is my personal financial data secure?",
      a: "Absolutely. FinSight implements multi-factor authentication, cryptographic security shields, and offline backup compliance codes to ensure your telemetry remains private.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30 selection:text-white">
      {/* Top sticky bar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-slate-950">
              FS
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FinSight</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectView("login")}
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors px-3 py-1.5 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onSelectView("login")}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl border border-sky-500/20 shadow-lg shadow-sky-950/50 transition-all cursor-pointer"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-400 text-[10px] font-mono tracking-widest uppercase rounded-full border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Fintech Intelligence Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Take Control of Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-emerald-400">
              Financial Future
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base leading-relaxed">
            Track expenses, monitor high-yield investments, calibrate your risk profiles, and utilize advanced server-side AI summaries for continuous capital safety audits.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl border border-sky-500/20 shadow-xl shadow-sky-950/50 transition-all cursor-pointer"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              View Simulated Demo
            </button>
          </div>

          {/* Clean Mockup UI Graphic */}
          <div className="pt-16 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/40"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/40"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/40"></span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono tracking-wider bg-slate-950 px-3 py-1 rounded-full border border-slate-800/65">
                  https://finsight.io/terminal_dashboard
                </div>
                <div className="w-10"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono">NET-WORTH RESERVES</span>
                  <p className="text-xl font-mono font-bold text-white mt-1">$178,421.25</p>
                  <span className="text-[9px] text-emerald-400 font-mono mt-1 block">+4.2% Growth Trend</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono">DISCRETIONARY EXPENSES</span>
                  <p className="text-xl font-mono font-bold text-rose-400 mt-1">$3,125.40</p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">34.3% recurring burn</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono">FINANCIAL SCORE</span>
                  <p className="text-xl font-mono font-bold text-sky-400 mt-1">84 / 100</p>
                  <span className="text-[9px] text-sky-400 font-mono mt-1 block">AI Calibration optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-sky-400 text-xs font-mono tracking-widest uppercase">Comprehensive Modules</span>
            <h2 className="text-3xl font-extrabold text-white">Engineered for Capital Precision</h2>
            <p className="max-w-xl mx-auto text-slate-400 text-sm">
              We replace guesswork with continuous analytical processing. Explore our core functional suites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-4 hover:border-sky-500/30 transition-all hover:-translate-y-1 group"
              >
                <div className={`p-3 rounded-xl w-12 h-12 flex items-center justify-center border ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold text-base">{f.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-sky-400 text-xs font-mono tracking-widest uppercase font-bold">Trusted Globally</span>
            <h2 className="text-3xl font-extrabold text-white">Approved by Wealth Architects</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((r, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4 relative">
                <div className="absolute top-4 right-4 text-sky-500/10">
                  <Star className="w-8 h-8 fill-sky-500/10" />
                </div>
                <p className="text-slate-300 text-xs italic leading-relaxed">
                  "{r.quote}"
                </p>
                <div>
                  <h4 className="text-white font-bold text-xs">{r.author}</h4>
                  <p className="text-slate-500 text-[10px] font-mono mt-0.5">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-sky-400 text-xs font-mono tracking-widest uppercase">Simple Calibration</span>
            <h2 className="text-3xl font-extrabold text-white">Flexible Investment Tiers</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Choose the depth of financial auditing required for your long-term wealth trajectories.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pricingTiers.map((p, i) => (
              <div
                key={i}
                className={`border rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all ${
                  p.highlight
                    ? "bg-gradient-to-b from-slate-900 to-sky-950/25 border-sky-500/30 shadow-xl shadow-sky-950/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 px-2.5 py-0.5 bg-sky-600 text-white font-mono text-[9px] font-bold uppercase rounded-md tracking-widest border border-sky-500/20">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-bold text-base">{p.name}</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-snug">{p.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-mono font-extrabold text-white">{p.price}</span>
                    <span className="text-slate-500 text-xs font-mono">/ {p.period}</span>
                  </div>

                  <div className="w-full h-[1px] bg-slate-800"></div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onGetStarted}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    p.highlight
                      ? "bg-sky-600 hover:bg-sky-500 text-white shadow-md border border-sky-500/20"
                      : "bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-sky-400 text-xs font-mono tracking-widest uppercase">FAQ Support</span>
            <h2 className="text-3xl font-extrabold text-white">Frequently Audited Inquiries</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-5 text-left text-xs font-bold text-white hover:bg-slate-850 cursor-pointer"
                >
                  <span>{f.q}</span>
                  <HelpCircle className={`w-4 h-4 text-sky-400 transition-transform ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="p-5 pt-0 border-t border-slate-800/40 text-xs text-slate-400 leading-relaxed bg-slate-950/20">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-slate-950">
                FS
              </div>
              <span className="text-xl font-bold text-white tracking-tight">FinSight</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Enterprise-grade wealth tracking and premium analytical ledgers. Built for responsive financial safety compliance.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-mono text-[10px] tracking-widest uppercase font-bold">Solutions</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-400">
              <a href="#features" className="hover:text-white">Expense Tracker</a>
              <a href="#features" className="hover:text-white">AI Asset Calibration</a>
              <a href="#features" className="hover:text-white">Trade Simulations</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-mono text-[10px] tracking-widest uppercase font-bold">Company</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-400">
              <span className="hover:text-white cursor-pointer">About Finsight</span>
              <span className="hover:text-white cursor-pointer">Security Protocol</span>
              <span className="hover:text-white cursor-pointer">Enterprise Compliance</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-mono text-[10px] tracking-widest uppercase font-bold">Disclaimer</h4>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              FinSight offers mock simulation tools only. No real bank accounts are linked, and no financial risk is incurred. Fully compliant with mock FINRA ratios.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span>© 2026 FinSight Intelligence Platforms Inc. All Rights Reserved.</span>
          <span>Deployment: BETA_STABLE v1.0.4</span>
        </div>
      </footer>
    </div>
  );
};
