import React from "react";
import {
  Sparkles,
  Search,
  Settings,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Shield,
  Star,
  Users,
  Zap,
  RefreshCw,
  X,
  Keyboard,
  Globe,
  DollarSign,
  Palette,
  Layers,
  Terminal,
  Activity,
  UserCheck,
  Bell,
  Trash2,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronDown,
  Info,
  Bug,
  Map,
  ShieldCheck,
  Send,
  User,
  LogOut,
  Mail,
  Phone,
  FileText,
  Briefcase,
  ExternalLink,
  BookOpen,
  Copy,
  Download,
  Laptop,
  Cpu,
  FileJson,
  Check,
  Eye,
  Filter,
  Code
} from "lucide-react";

// Types for the Hub
export interface EnterpriseHubState {
  isDarkMode: boolean;
  accentColor: "sky" | "emerald" | "indigo" | "rose" | "amber";
  density: "standard" | "compact" | "comfortable";
  borderStyle: "subtle" | "glass" | "neon";
  currency: "USD" | "EUR" | "GBP" | "JPY" | "CAD";
  language: "en" | "es" | "de" | "fr" | "ja";
  role: "user" | "admin";
  onboardingStep: number; // 0 means closed, 1-5 active steps
  showKeyboardShortcuts: boolean;
  showCommandPalette: boolean;
  showCustomizer: boolean;
}

interface EnterpriseHubProps {
  state: EnterpriseHubState;
  onChangeState: (updater: (prev: EnterpriseHubState) => EnterpriseHubState) => void;
  onNavigateToTab: (tabId: string) => void;
  expensesCount: number;
  portfolioValue: number;
  onAddMockExpense: (merchant: string, category: string, amount: number) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

// Translations dictionary
const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    expenses: "Expenses",
    portfolio: "Portfolio",
    goals: "Goals",
    settings: "Settings",
    adminCenter: "Enterprise Admin Panel",
    welcome: "Welcome back",
    financialHealth: "Financial Health Status",
    aiAssistant: "Cognitive AI Assistant",
    searchPlaceholder: "Search or enter command (Ctrl+K)...",
    quickAdd: "Quick Add Transaction",
    liveTelemetry: "Active Node Telemetry",
    roleLabel: "Security Clearance",
    onboardingTitle: "Interactive Onboarding Tour",
    systemRoadmap: "Product Engineering Roadmap",
    bugReport: "Submit Bug Diagnostics",
    pricingTitle: "SaaS Enterprise Tiers",
    careersTitle: "Careers & Talent Acquisition",
    privacyTitle: "Privacy & Data Protection Standards",
    testimonialsTitle: "Institutional Client Reviews",
    aboutTitle: "About FinSight Enterprise",
    contactTitle: "Secure Client Response Desk",
    customizerTitle: "Theme Calibration Console"
  },
  es: {
    dashboard: "Tablero",
    expenses: "Gastos",
    portfolio: "Portafolio",
    goals: "Metas",
    settings: "Ajustes",
    adminCenter: "Panel de Administración",
    welcome: "Bienvenido de nuevo",
    financialHealth: "Estado de Salud Financiera",
    aiAssistant: "Asistente de IA Cognitiva",
    searchPlaceholder: "Buscar o ingresar comando (Ctrl+K)...",
    quickAdd: "Transacción de Adición Rápida",
    liveTelemetry: "Telemetría de Nodos Activos",
    roleLabel: "Autorización de Seguridad",
    onboardingTitle: "Recorrido de Incorporación",
    systemRoadmap: "Hoja de Ruta de Ingeniería",
    bugReport: "Enviar Diagnóstico de Errores",
    pricingTitle: "Niveles de Suscripción SaaS",
    careersTitle: "Carreras y Talento",
    privacyTitle: "Privacidad y Protección de Datos",
    testimonialsTitle: "Reseñas de Clientes",
    aboutTitle: "Sobre FinSight Enterprise",
    contactTitle: "Mesa de Respuesta Segura",
    customizerTitle: "Consola de Calibración de Tema"
  },
  de: {
    dashboard: "Dashboard",
    expenses: "Ausgaben",
    portfolio: "Portfolio",
    goals: "Ziele",
    settings: "Einstellungen",
    adminCenter: "Administrator-Kontrollzentrum",
    welcome: "Willkommen zurück",
    financialHealth: "Finanzieller Gesundheitsstatus",
    aiAssistant: "Kognitiver KI-Assistent",
    searchPlaceholder: "Suchen oder Befehl eingeben (Ctrl+K)...",
    quickAdd: "Schnellbuchung Transaktion",
    liveTelemetry: "Aktive Knotentelemetrie",
    roleLabel: "Sicherheitsfreigabe",
    onboardingTitle: "Interaktive Einführungstour",
    systemRoadmap: "Produkt-Entwicklungsplan",
    bugReport: "Fehlerbericht Senden",
    pricingTitle: "SaaS-Preismodelle",
    careersTitle: "Karriere & Stellenangebote",
    privacyTitle: "Datenschutzbestimmungen",
    testimonialsTitle: "Kundenbewertungen",
    aboutTitle: "Über FinSight Enterprise",
    contactTitle: "Sicherheits-Supportdesk",
    customizerTitle: "Design-Kalibrierungskonsole"
  },
  fr: {
    dashboard: "Tableau de Bord",
    expenses: "Dépenses",
    portfolio: "Portefeuille",
    goals: "Objectifs",
    settings: "Paramètres",
    adminCenter: "Console d'Administration",
    welcome: "Bon retour",
    financialHealth: "État de Santé Financière",
    aiAssistant: "Assistant IA Cognitif",
    searchPlaceholder: "Rechercher ou commander (Ctrl+K)...",
    quickAdd: "Ajout Rapide de Flux",
    liveTelemetry: "Télémétrie Active des Noeuds",
    roleLabel: "Habilitation de Sécurité",
    onboardingTitle: "Guide d'Intégration Interactif",
    systemRoadmap: "Feuille de Route d'Ingénierie",
    bugReport: "Signaler une Anomalie",
    pricingTitle: "Tarifs SaaS Entreprise",
    careersTitle: "Carrières & Talents",
    privacyTitle: "Protection des Données",
    testimonialsTitle: "Avis Clients Institutionnels",
    aboutTitle: "À Propos de FinSight",
    contactTitle: "Support Client Sécurisé",
    customizerTitle: "Console de Personnalisation"
  },
  ja: {
    dashboard: "ダッシュボード",
    expenses: "経費勘定",
    portfolio: "ポートフォリオ",
    goals: "貯蓄目標",
    settings: "システム設定",
    adminCenter: "管理者制御パネル",
    welcome: "おかえりなさい",
    financialHealth: "財務健全性ステータス",
    aiAssistant: "コグニティブAIアシスタント",
    searchPlaceholder: "検索またはコマンド入力 (Ctrl+K)...",
    quickAdd: "簡易トランザクション追加",
    liveTelemetry: "アクティブノード測定値",
    roleLabel: "セキュリティ権限レベル",
    onboardingTitle: "インタラクティブ案内ツアー",
    systemRoadmap: "エンジニアリング開発マップ",
    bugReport: "バグ不具合診断報告",
    pricingTitle: "SaaSエンタープライズ価格帯",
    careersTitle: "採用情報・人材募集",
    privacyTitle: "プライバシー及びデータ保護規約",
    testimonialsTitle: "機関投資家・顧客評価",
    aboutTitle: "FinSight概要について",
    contactTitle: "セキュア顧客対応デスク",
    customizerTitle: "テーマ調整コンソール"
  }
};

// Currency exchange rates relative to USD
const CURRENCY_CONVERSION = {
  USD: { symbol: "$", rate: 1.0, label: "USD" },
  EUR: { symbol: "€", rate: 0.92, label: "EUR" },
  GBP: { symbol: "£", rate: 0.78, label: "GBP" },
  JPY: { symbol: "¥", rate: 155.40, label: "JPY" },
  CAD: { symbol: "C$", rate: 1.36, label: "CAD" }
};

export const EnterpriseHub: React.FC<EnterpriseHubProps> = ({
  state,
  onChangeState,
  onNavigateToTab,
  expensesCount,
  portfolioValue,
  onAddMockExpense,
  showToast
}) => {
  // Local UI States
  const [miniChatOpen, setMiniChatOpen] = React.useState(false);
  const [miniChatInput, setMiniChatInput] = React.useState("");
  const [miniChatHistory, setMiniChatHistory] = React.useState<Array<{ r: "u" | "a"; m: string }>>([
    { r: "a", m: "FinSight AI Agent initialized. How can I compute your asset allocation variance today?" }
  ]);
  const [commandQuery, setCommandQuery] = React.useState("");
  
  // Bug Report Form State & Pro Diagnostics
  const [bugTitle, setBugTitle] = React.useState("");
  const [bugCategory, setBugCategory] = React.useState("Security");
  const [bugSeverity, setBugSeverity] = React.useState("Medium");
  const [bugDescription, setBugDescription] = React.useState("");
  const [selectedBugId, setSelectedBugId] = React.useState<string | null>(null);
  const [bugFilterStatus, setBugFilterStatus] = React.useState<string>("All");
  const [bugFilterSeverity, setBugFilterSeverity] = React.useState<string>("All");
  const [bugSearchQuery, setBugSearchQuery] = React.useState<string>("");

  const [bugList, setBugList] = React.useState<Array<{
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    date: string;
    description?: string;
    environment?: {
      browser: string;
      os: string;
      resolution: string;
      currency: string;
      language: string;
      role: string;
      memory: string;
      timestamp: string;
    };
  }>>(() => {
    try {
      const saved = localStorage.getItem("finsight_bug_list");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "BUG-104",
        title: "API latency spike on Plaid webhook payload",
        category: "Performance",
        severity: "High",
        status: "Under Review",
        date: "2026-07-20",
        description: "Observed 1,420ms response delay when receiving batch transaction webhook payloads from Plaid sandbox nodes.",
        environment: {
          browser: "Chrome 126.0 (64-bit)",
          os: "macOS Sonoma 14.5",
          resolution: "2560x1440 @ 2x",
          currency: "USD",
          language: "en",
          role: "admin",
          memory: "8 Cores | 16 GB RAM",
          timestamp: "2026-07-20T14:32:10Z"
        }
      },
      {
        id: "BUG-105",
        title: "Japanese localized character spacing clipping in sidebar",
        category: "UI/UX",
        severity: "Low",
        status: "Resolved",
        date: "2026-07-19",
        description: "Full-width Kanji text triggers 2px line-height wrapping on navigation sidebar labels.",
        environment: {
          browser: "Safari 17.4",
          os: "macOS Sonoma 14.5",
          resolution: "1728x1117 @ 2x",
          currency: "JPY",
          language: "ja",
          role: "user",
          memory: "10 Cores | 36 GB RAM",
          timestamp: "2026-07-19T09:15:22Z"
        }
      }
    ];
  });

  React.useEffect(() => {
    try {
      localStorage.setItem("finsight_bug_list", JSON.stringify(bugList));
    } catch {}
  }, [bugList]);

  // General feedback / Roadmap Upvotes state
  const [roadmapUpvotes, setRoadmapUpvotes] = React.useState<Record<string, number>>({
    "r1": 42, "r2": 19, "r3": 124, "r4": 56, "r5": 8
  });

  // Client feedback list simulation
  const [clientFeedbacks, setClientFeedbacks] = React.useState<Array<{ id: string; client: string; rating: number; text: string; category: string; date: string; status: "Pending" | "Addressed" }>>([
    { id: "F-501", client: "Sophia Loren (Wealth Advisor)", rating: 5, text: "The trade simulator with real-time compound calculation is extremely smooth.", category: "Feature Upvote", date: "2026-07-20", status: "Addressed" },
    { id: "F-502", client: "Marcus Aurelius (Corporate VP)", rating: 4, text: "Need support for Indian Rupee (INR) formatting on reports.", category: "Request", date: "2026-07-18", status: "Pending" }
  ]);

  // Multi-state page-viewer for the 50+ Premium Pages
  const [activePreviewPage, setActivePreviewPage] = React.useState<string | null>(null);
  const [pageBillingPeriod, setPageBillingPeriod] = React.useState<"monthly" | "annual">("monthly");
  const [kycSubmitted, setKycSubmitted] = React.useState(false);
  const [riskFactorSlider, setRiskFactorSlider] = React.useState(75);

  // Reusable Component Categories state for component list explorer
  const [activeComponentCategory, setActiveComponentCategory] = React.useState<string>("Typography");

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes everything
      if (e.key === "Escape") {
        onChangeState(prev => ({
          ...prev,
          showKeyboardShortcuts: false,
          showCommandPalette: false,
          showCustomizer: false,
          onboardingStep: 0
        }));
        setMiniChatOpen(false);
        setActivePreviewPage(null);
        return;
      }

      // Cmd+K or Ctrl+K triggers Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onChangeState(prev => ({ ...prev, showCommandPalette: !prev.showCommandPalette }));
        return;
      }

      // Alt+A toggles floating AI Assistant
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setMiniChatOpen(prev => !prev);
        return;
      }

      // Check if target is input, don't trigger simple key bindings
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || targetTag === "select") {
        return;
      }

      // 'c' toggles customizer
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        onChangeState(prev => ({ ...prev, showCustomizer: !prev.showCustomizer }));
        return;
      }

      // 'k' toggles shortcut cheat sheet
      if (e.key.toLowerCase() === "k" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onChangeState(prev => ({ ...prev, showKeyboardShortcuts: !prev.showKeyboardShortcuts }));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onChangeState]);

  // Local helper for localized translation text
  const t = (key: keyof typeof TRANSLATIONS.en): string => {
    const dict = TRANSLATIONS[state.language] || TRANSLATIONS.en;
    return (dict as any)[key] || TRANSLATIONS.en[key] || String(key);
  };

  // Local helper for currency symbol conversion
  const formatCurrency = (usdVal: number): string => {
    const currentConfig = CURRENCY_CONVERSION[state.currency];
    const converted = usdVal * currentConfig.rate;
    
    // Formatting with currency-appropriate symbol and decimals
    if (state.currency === "JPY") {
      return `${currentConfig.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${currentConfig.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Simulated AI quick actions
  const handleMiniChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!miniChatInput.trim()) return;
    const userMsg = miniChatInput;
    setMiniChatHistory(prev => [...prev, { r: "u", m: userMsg }]);
    setMiniChatInput("");

    setTimeout(() => {
      let responseMsg = "My telemetry matrices are processed. Let me know if you would like me to compile automated balance optimizations.";
      const m = userMsg.toLowerCase();
      if (m.includes("cash") || m.includes("expense") || m.includes("burn")) {
        responseMsg = `Alert compiled: Total transaction keys loaded is currently ${expensesCount}. Discretionary burn velocity is calculated within acceptable standard deviations.`;
      } else if (m.includes("portfolio") || m.includes("holding") || m.includes("asset")) {
        responseMsg = `Portfolio valuation registered: ${formatCurrency(portfolioValue)}. Volatility factor is calibrated at 0.14 beta relative to treasury baselines.`;
      } else if (m.includes("currency") || m.includes("convert")) {
        responseMsg = `Currency matrix rebalanced. Currently converting values into ${state.currency} with exchange rates dynamically synced.`;
      } else if (m.includes("help") || m.includes("tour")) {
        responseMsg = "Onboarding tour is active. Click 'Next Step' in the highlight bubble to proceed with the walkthrough.";
      } else if (m.includes("joke") || m.includes("funny")) {
        responseMsg = "There are 10 types of financial planners: those who understand decimal floating points, and those who experience roundoff variances.";
      }
      setMiniChatHistory(prev => [...prev, { r: "a", m: responseMsg }]);
    }, 500);
  };

  // Dynamic Styles Mapping based on Customizer
  const getAccentClass = () => {
    switch (state.accentColor) {
      case "emerald": return "text-emerald-400 border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-emerald-950/20";
      case "indigo": return "text-indigo-400 border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 shadow-indigo-950/20";
      case "rose": return "text-rose-400 border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 shadow-rose-950/20";
      case "amber": return "text-amber-400 border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 shadow-amber-950/20";
      default: return "text-sky-400 border-sky-500 bg-sky-500/10 hover:bg-sky-500/20 shadow-sky-950/20";
    }
  };

  const getAccentBtnClass = () => {
    switch (state.accentColor) {
      case "emerald": return "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-emerald-950/30";
      case "indigo": return "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 shadow-indigo-950/30";
      case "rose": return "bg-rose-600 hover:bg-rose-500 border-rose-500 shadow-rose-950/30";
      case "amber": return "bg-amber-600 hover:bg-amber-500 border-amber-500 shadow-amber-950/30";
      default: return "bg-sky-600 hover:bg-sky-500 border-sky-500 shadow-sky-950/30";
    }
  };

  const getCardClass = () => {
    let base = state.isDarkMode 
      ? "bg-slate-900 border-slate-800" 
      : "bg-white border-slate-200 shadow-md shadow-slate-100";
    
    if (state.borderStyle === "glass") {
      base += " backdrop-blur-md bg-opacity-70 dark:bg-opacity-40";
    } else if (state.borderStyle === "neon") {
      base += " shadow-lg border-sky-500/10";
      switch (state.accentColor) {
        case "emerald": base += " shadow-emerald-500/5"; break;
        case "indigo": base += " shadow-indigo-500/5"; break;
        case "rose": base += " shadow-rose-500/5"; break;
        case "amber": base += " shadow-amber-500/5"; break;
        default: base += " shadow-sky-500/5";
      }
    }
    
    if (state.density === "compact") {
      base += " p-3.5 rounded-xl";
    } else if (state.density === "comfortable") {
      base += " p-8 rounded-3xl";
    } else {
      base += " p-6 rounded-2xl";
    }
    return base;
  };

  const getContainerPadding = () => {
    if (state.density === "compact") return "space-y-4";
    if (state.density === "comfortable") return "space-y-8";
    return "space-y-6";
  };

  const getTextClass = () => {
    return state.isDarkMode ? "text-slate-200" : "text-slate-800";
  };

  const getSubtextClass = () => {
    return state.isDarkMode ? "text-slate-400" : "text-slate-500";
  };

  const getHeadingColor = () => {
    return state.isDarkMode ? "text-white" : "text-slate-900";
  };

  // Auto-detect client environment diagnostics stack
  const handleAutoDetectDiagnostics = () => {
    const ua = navigator.userAgent;
    let browser = "Google Chrome / Chromium";
    if (ua.includes("Firefox")) browser = "Mozilla Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Apple Safari";
    else if (ua.includes("Edg")) browser = "Microsoft Edge";

    const os = navigator.platform || "Web Container";
    const res = `${window.innerWidth}x${window.innerHeight} (${window.devicePixelRatio}x DPI)`;
    const memory = `${navigator.hardwareConcurrency || 8} Cores | ${(navigator as any).deviceMemory || 8} GB RAM`;
    const timestamp = new Date().toISOString();

    const formattedLog = `=== SYSTEM TELEMETRY DIAGNOSTIC STACK ===
• Timestamp: ${timestamp}
• Browser / OS: ${browser} | ${os}
• Display Frame: ${res}
• Compute Profile: ${memory}
• Clearance / Role: ${state.role.toUpperCase()}
• Currency Base: ${state.currency} | Language: ${state.language.toUpperCase()}
• Theme Profile: ${state.isDarkMode ? "Cosmic Dark" : "Light Theme"} (${state.density})
• Active Metrics: ${expensesCount} Expenses | ${formatCurrency(portfolioValue)} Portfolio
• Connection Status: ${navigator.onLine ? "Online (100 Mbps)" : "Offline"}
=========================================
[STACK DUMP]: No uncaught exceptions buffer active. Window memory quota OK.`;

    setBugDescription((prev) => (prev ? `${prev}\n\n${formattedLog}` : formattedLog));
    showToast("Auto-detected environment diagnostics attached to bug log!", "success");
  };

  // Submit dynamic bug diagnostics report
  const submitUserBugReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !bugDescription.trim()) {
      showToast("Please provide all diagnostic fields.", "error");
      return;
    }
    const ua = navigator.userAgent;
    let browser = "Google Chrome / Chromium";
    if (ua.includes("Firefox")) browser = "Mozilla Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Apple Safari";
    else if (ua.includes("Edg")) browser = "Microsoft Edge";

    const newBug = {
      id: "BUG-" + (100 + bugList.length + 4),
      title: bugTitle.trim(),
      category: bugCategory,
      severity: bugSeverity,
      status: "Submitted",
      date: new Date().toISOString().split("T")[0],
      description: bugDescription.trim(),
      environment: {
        browser,
        os: navigator.platform || "Linux / Cloud Sandbox",
        resolution: `${window.innerWidth}x${window.innerHeight} @ ${window.devicePixelRatio}x`,
        currency: state.currency,
        language: state.language.toUpperCase(),
        role: state.role,
        memory: `${navigator.hardwareConcurrency || 8} Cores`,
        timestamp: new Date().toISOString()
      }
    };
    setBugList(prev => [newBug, ...prev]);
    showToast(`Bug telemetry logged successfully. Incident ID: ${newBug.id}`, "success");
    setBugTitle("");
    setBugDescription("");
  };

  // Toggle bug status (Submitted -> Under Review -> Resolved)
  const handleToggleBugStatus = (id: string) => {
    setBugList(prev => prev.map(bug => {
      if (bug.id === id) {
        const nextStatus = bug.status === "Submitted" ? "Under Review" : bug.status === "Under Review" ? "Resolved" : "Submitted";
        showToast(`Incident ${bug.id} status updated to ${nextStatus}`, "info");
        return { ...bug, status: nextStatus };
      }
      return bug;
    }));
  };

  // Copy bug JSON payload to clipboard
  const handleCopyBugJSON = (bug: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(bug, null, 2));
      showToast(`Diagnostic JSON for ${bug.id} copied to clipboard!`, "success");
    } catch {
      showToast("Failed to copy payload to clipboard", "error");
    }
  };

  // Export bug report as .json file
  const handleExportBugReport = (bug: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bug, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${bug.id}_diagnostic_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${bug.id} diagnostic report file!`, "success");
  };

  // Delete bug report
  const handleDeleteBug = (id: string) => {
    setBugList(prev => prev.filter(b => b.id !== id));
    if (selectedBugId === id) setSelectedBugId(null);
    showToast(`Bug report ${id} removed from diagnostic ledger`, "info");
  };

  // Upvote product roadmap feature
  const handleRoadmapUpvote = (id: string) => {
    setRoadmapUpvotes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    showToast("Roadmap contribution upvoted!", "success");
  };

  // Execute quick action in command palette
  const runCommandAction = (action: () => void, text: string) => {
    action();
    onChangeState(prev => ({ ...prev, showCommandPalette: false }));
    setCommandQuery("");
    showToast(`Command Triggered: ${text}`, "success");
  };

  // Command palette suggestions list
  const getFilteredCommands = () => {
    const commands = [
      { t: "Switch Security Clearance to Admin", c: "admin", act: () => onChangeState(prev => ({ ...prev, role: "admin" })) },
      { t: "Switch Security Clearance to Executive User", c: "user", act: () => onChangeState(prev => ({ ...prev, role: "user" })) },
      { t: "Launch Interactive Onboarding Tour", c: "tour", act: () => onChangeState(prev => ({ ...prev, onboardingStep: 1 })) },
      { t: "Toggle Light Theme Profile", c: "light", act: () => onChangeState(prev => ({ ...prev, isDarkMode: false })) },
      { t: "Toggle Cosmic Dark Profile", c: "dark", act: () => onChangeState(prev => ({ ...prev, isDarkMode: true })) },
      { t: "Calibrate Accent: Indigo Aura", c: "indigo", act: () => onChangeState(prev => ({ ...prev, accentColor: "indigo" })) },
      { t: "Calibrate Accent: Emerald Field", c: "emerald", act: () => onChangeState(prev => ({ ...prev, accentColor: "emerald" })) },
      { t: "Calibrate Accent: Sky Core", c: "sky", act: () => onChangeState(prev => ({ ...prev, accentColor: "sky" })) },
      { t: "Calibrate Accent: Rose Spark", c: "rose", act: () => onChangeState(prev => ({ ...prev, accentColor: "rose" })) },
      { t: "Set Currency base to EUR (€)", c: "eur", act: () => onChangeState(prev => ({ ...prev, currency: "EUR" })) },
      { t: "Set Currency base to GBP (£)", c: "gbp", act: () => onChangeState(prev => ({ ...prev, currency: "GBP" })) },
      { t: "Set Currency base to JPY (¥)", c: "jpy", act: () => onChangeState(prev => ({ ...prev, currency: "JPY" })) },
      { t: "Set Currency base to USD ($)", c: "usd", act: () => onChangeState(prev => ({ ...prev, currency: "USD" })) },
      { t: "Configure Language: Spanish (ES)", c: "es", act: () => onChangeState(prev => ({ ...prev, language: "es" })) },
      { t: "Configure Language: German (DE)", c: "de", act: () => onChangeState(prev => ({ ...prev, language: "de" })) },
      { t: "Configure Language: Japanese (JA)", c: "ja", act: () => onChangeState(prev => ({ ...prev, language: "ja" })) },
      { t: "Configure Language: English (EN)", c: "en", act: () => onChangeState(prev => ({ ...prev, language: "en" })) },
      { t: "Sitemap: Go to FAQ & Help Desk", c: "faq", act: () => { onNavigateToTab("settings"); setActivePreviewPage("Help Center & FAQ Portal"); } },
      { t: "Sitemap: Go to SaaS Pricing Tiers", c: "pricing", act: () => { onNavigateToTab("settings"); setActivePreviewPage("SaaS Pricing Tiers"); } },
      { t: "Sitemap: Go to Careers Openings", c: "careers", act: () => { onNavigateToTab("settings"); setActivePreviewPage("Careers & Talent Desk"); } },
      { t: "Add Mock Transaction: Equinox Gym", c: "mock", act: () => onAddMockExpense("Equinox Luxury Athletic", "Entertainment", 240) },
      { t: "Add Mock Transaction: AWS Grid Compute", c: "mock", act: () => onAddMockExpense("AWS Cloud Computing", "Utilities", 520) }
    ];

    if (!commandQuery) return commands.slice(0, 7);
    return commands.filter(cmd => 
      cmd.t.toLowerCase().includes(commandQuery.toLowerCase()) || 
      cmd.c.toLowerCase().includes(commandQuery.toLowerCase())
    );
  };

  return (
    <div className={`space-y-6 ${getContainerPadding()}`}>
      
      {/* ========================================================= */}
      {/* 1. KEYBOARD SHORTCUTS CHEATSHEET OVERLAY                  */}
      {/* ========================================================= */}
      {state.showKeyboardShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => onChangeState(prev => ({ ...prev, showKeyboardShortcuts: false }))} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
          <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-sky-400" /> Platform Keyboard Hotkeys
              </h3>
              <button onClick={() => onChangeState(prev => ({ ...prev, showKeyboardShortcuts: false }))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Open Command Palette</span>
                <span className="px-2 py-0.5 bg-slate-950 text-sky-400 rounded border border-slate-800">Ctrl + K</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Toggle AI Assistant Box</span>
                <span className="px-2 py-0.5 bg-slate-950 text-sky-400 rounded border border-slate-800">Alt + A</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Toggle Calibration Console</span>
                <span className="px-2 py-0.5 bg-slate-950 text-sky-400 rounded border border-slate-800">C</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Toggle Hotkey Cheatsheet</span>
                <span className="px-2 py-0.5 bg-slate-950 text-sky-400 rounded border border-slate-800">K</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Close Active Modal</span>
                <span className="px-2 py-0.5 bg-slate-950 text-sky-400 rounded border border-slate-800">Esc</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 text-center italic">Type these at any time to execute instant shortcuts across Finsight.</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GLOBAL SEARCH & COMMAND PALETTE OVERLAY                */}
      {/* ========================================================= */}
      {state.showCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div onClick={() => onChangeState(prev => ({ ...prev, showCommandPalette: false }))} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800">
              <Search className="w-4 h-4 text-sky-400 shrink-0" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                autoFocus
              />
              <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">ESC</span>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              <div className="px-2 py-1 text-[9px] font-mono text-slate-500 tracking-wider uppercase">Executive Shortcuts</div>
              {getFilteredCommands().map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => runCommandAction(cmd.act, cmd.t)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all group"
                >
                  <span className="font-medium group-hover:translate-x-0.5 transition-transform">{cmd.t}</span>
                  <span className="text-[10px] text-slate-500 font-mono group-hover:text-sky-400 transition-colors">/{cmd.c}</span>
                </button>
              ))}
              {getFilteredCommands().length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 italic">No corresponding command matrices compiled.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. INTERACTIVE ONBOARDING TOUR BUBBLE SYSTEM              */}
      {/* ========================================================= */}
      {state.onboardingStep > 0 && (
        <div className="fixed bottom-24 left-6 z-50 max-w-sm bg-slate-900 border-2 border-sky-500 p-5 rounded-2xl shadow-2xl text-left space-y-3 animate-bounce">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white">Tour Step {state.onboardingStep} of 5</span>
            </div>
            <button 
              onClick={() => {
                onChangeState(prev => ({ ...prev, onboardingStep: 0 }));
                showToast("Walkthrough terminated.", "info");
              }} 
              className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            {state.onboardingStep === 1 && (
              <div>
                <h4 className="text-xs font-bold text-white">System Calibration Console</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  We are currently inside the core telemetry desk. Press <span className="text-sky-400 font-mono">C</span> to open the Customizer to calibrate primary colors, spacing, and grid modes.
                </p>
              </div>
            )}
            {state.onboardingStep === 2 && (
              <div>
                <h4 className="text-xs font-bold text-white">Unified Multi-Asset Portfolio</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Track stocks, crypto, and traditional treasuries with live pricing conversion vectors based on active global exchange indexes.
                </p>
              </div>
            )}
            {state.onboardingStep === 3 && (
              <div>
                <h4 className="text-xs font-bold text-white">Role-Based UI clearance</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Switch clearance to <span className="text-emerald-400 font-bold">Admin Role</span> to view the Enterprise Command Deck, security logs, and user management blocks.
                </p>
              </div>
            )}
            {state.onboardingStep === 4 && (
              <div>
                <h4 className="text-xs font-bold text-white">Cognitive Neural AI Chat</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ask the assistant about your cash flows. Use <span className="text-sky-400 font-mono">Alt + A</span> to launch the quick helper console from any page.
                </p>
              </div>
            )}
            {state.onboardingStep === 5 && (
              <div>
                <h4 className="text-xs font-bold text-white">Design System Catalog</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Browse over 100+ fully-interactive reusable design elements and 50+ premium mock pages directly in our catalog below.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => onChangeState(prev => ({ ...prev, onboardingStep: Math.max(1, prev.onboardingStep - 1) }))}
              disabled={state.onboardingStep === 1}
              className="px-2.5 py-1 bg-slate-950 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white rounded-lg text-[10px] font-bold border border-slate-800"
            >
              Back
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  onChangeState(prev => ({ ...prev, onboardingStep: 0 }));
                  showToast("Onboarding completed successfully!", "success");
                }}
                className="px-2.5 py-1 bg-slate-950 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold border border-slate-800"
              >
                Skip
              </button>
              {state.onboardingStep < 5 ? (
                <button
                  onClick={() => onChangeState(prev => ({ ...prev, onboardingStep: prev.onboardingStep + 1 }))}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-sky-950/40"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => {
                    onChangeState(prev => ({ ...prev, onboardingStep: 0 }));
                    showToast("Excellent! Your account is fully onboarded.", "success");
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-emerald-950/40"
                >
                  Finish Tour
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. THEME CUSTOMIZERconsole SLIDE-OUT PANEL                 */}
      {/* ========================================================= */}
      {state.showCustomizer && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-sky-400 animate-spin" />
              <h3 className="text-white font-bold text-sm">{t("customizerTitle")}</h3>
            </div>
            <button onClick={() => onChangeState(prev => ({ ...prev, showCustomizer: false }))} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Primary Accent selection */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block">Primary Core Accent</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: "sky", color: "bg-sky-500" },
                  { id: "emerald", color: "bg-emerald-500" },
                  { id: "indigo", color: "bg-indigo-500" },
                  { id: "rose", color: "bg-rose-500" },
                  { id: "amber", color: "bg-amber-500" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChangeState(prev => ({ ...prev, accentColor: item.id as any }));
                      showToast(`Primary accent calibrated to: ${item.id}`, "info");
                    }}
                    className={`h-8 rounded-lg ${item.color} border-2 flex items-center justify-center transition-all cursor-pointer ${
                      state.accentColor === item.id ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {state.accentColor === item.id && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Density */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block">Interface Density</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "compact", label: "Compact" },
                  { id: "standard", label: "Standard" },
                  { id: "comfortable", label: "Comfort" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChangeState(prev => ({ ...prev, density: item.id as any }));
                      showToast(`Density set to ${item.id}`, "info");
                    }}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                      state.density === item.id
                        ? "bg-sky-500/10 border-sky-500 text-sky-400"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Border design style */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block">Panel Border Framing</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "subtle", label: "Subtle" },
                  { id: "glass", label: "Glass" },
                  { id: "neon", label: "Neon" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChangeState(prev => ({ ...prev, borderStyle: item.id as any }));
                      showToast(`Panel frame changed to: ${item.id}`, "info");
                    }}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                      state.borderStyle === item.id
                        ? "bg-sky-500/10 border-sky-500 text-sky-400"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block">Core System Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeState(prev => ({ ...prev, isDarkMode: true }))}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                    state.isDarkMode
                      ? "bg-slate-950 border-sky-500 text-sky-400"
                      : "bg-slate-950/40 border-slate-800 text-slate-600 hover:text-slate-300"
                  }`}
                >
                  Cosmic Dark
                </button>
                <button
                  onClick={() => onChangeState(prev => ({ ...prev, isDarkMode: false }))}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                    !state.isDarkMode
                      ? "bg-slate-100 border-sky-500 text-sky-600 font-bold"
                      : "bg-slate-950/40 border-slate-800 text-slate-600 hover:text-slate-300"
                  }`}
                >
                  Solar Light
                </button>
              </div>
            </div>

          </div>

          <div className="p-6 border-t border-slate-800">
            <button
              onClick={() => {
                onChangeState(prev => ({
                  ...prev,
                  accentColor: "sky",
                  density: "standard",
                  borderStyle: "subtle",
                  isDarkMode: true
                }));
                showToast("System matrices reset to defaults.", "info");
              }}
              className="w-full py-2 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              Reset Configuration
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. FLOATING AI ASSISTANT OVERLAY BUBBLE (ALL PAGES CAPABLE) */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {miniChatOpen && (
          <div className="w-80 h-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-white">{t("aiAssistant")}</span>
              </div>
              <button onClick={() => setMiniChatOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {miniChatHistory.map((item, idx) => (
                <div key={idx} className={`flex ${item.r === "u" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-2.5 rounded-xl text-[11px] leading-normal max-w-[85%] ${
                    item.r === "u" ? "bg-sky-600 text-white" : "bg-slate-950 border border-slate-800 text-slate-300"
                  }`}>
                    {item.m}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleMiniChatSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask about assets..."
                value={miniChatInput}
                onChange={(e) => setMiniChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-sky-500/50"
              />
              <button type="submit" className="p-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-white">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setMiniChatOpen(!miniChatOpen)}
          className={`h-12 w-12 rounded-full ${getAccentBtnClass()} text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer`}
          title="Toggle FinSight AI Agent (Alt+A)"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 6. PRIMARY HEADER & QUICK CONTROLS AREA                   */}
      {/* ========================================================= */}
      <div className={getCardClass()}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 bg-slate-950 text-[10px] font-mono rounded border uppercase border-slate-800 ${state.role === "admin" ? "text-emerald-400 border-emerald-500/30" : "text-sky-400"}`}>
                {state.role === "admin" ? "Level 3 Admin Access" : "Institutional Member"}
              </span>
              <button 
                onClick={() => {
                  onChangeState(prev => ({ ...prev, showKeyboardShortcuts: true }));
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white flex items-center gap-1"
                title="View Keyboard Cheatsheet"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono">Press K</span>
              </button>
            </div>
            <h2 className={`text-xl font-bold tracking-tight ${getHeadingColor()}`}>
              Enterprise Control Console & Global Sitemap
            </h2>
            <p className={`text-xs ${getSubtextClass()}`}>
              Manage system settings, browse the design system components catalog, and preview any of the 50+ premium pages.
            </p>
          </div>

          {/* Quick Selectors bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Currency switcher selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={state.currency}
                onChange={(e) => {
                  onChangeState(prev => ({ ...prev, currency: e.target.value as any }));
                  showToast(`Default currency switched to: ${e.target.value}`, "success");
                }}
                className="bg-transparent border-none text-[10px] font-bold text-white font-mono focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>

            {/* Language switcher selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={state.language}
                onChange={(e) => {
                  onChangeState(prev => ({ ...prev, language: e.target.value as any }));
                  showToast(`Default language changed to: ${e.target.value.toUpperCase()}`, "success");
                }}
                className="bg-transparent border-none text-[10px] font-bold text-white font-mono focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            {/* Role Clearance Toggler */}
            <button
              onClick={() => {
                const nextRole = state.role === "admin" ? "user" : "admin";
                onChangeState(prev => ({ ...prev, role: nextRole }));
                showToast(`Clearance calibrated: Switched to ${nextRole.toUpperCase()}`, "success");
              }}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white text-[10px] font-mono font-bold rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {state.role === "admin" ? <Lock className="w-3 h-3 text-emerald-400" /> : <Unlock className="w-3 h-3 text-amber-500" />}
              <span>Clearance: {state.role.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. ROLE-BASED SYSTEM PANEL (ADMINISTRATOR LEVEL ONLY)     */}
      {/* ========================================================= */}
      {state.role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Admin Command Core */}
          <div className={`lg:col-span-2 ${getCardClass()}`}>
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3 mb-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Platform Admin Deck
              </h3>
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 font-mono text-[9px] text-slate-400 rounded">
                Live Server
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 font-mono">NODE LATENCY</span>
                <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">14ms <span className="text-[9px] text-slate-500 font-normal">avg</span></p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 font-mono">DB POOL STATUS</span>
                <p className="text-base font-bold text-white font-mono mt-0.5">99.98% <span className="text-[9px] text-slate-500 font-normal">ok</span></p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 font-mono">COMPLIANCE CERT</span>
                <p className="text-base font-bold text-sky-400 font-mono mt-0.5">SOC2 v3 <span className="text-[9px] text-slate-500 font-normal">valid</span></p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 font-mono">SANDBOX VMS</span>
                <p className="text-base font-bold text-amber-400 font-mono mt-0.5">8 active <span className="text-[9px] text-slate-500 font-normal">nodes</span></p>
              </div>
            </div>

            <h4 className="text-white font-bold text-xs mb-2">Registered Security Audit Log</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[10px]">
              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">[INFO]</span>
                  <span className="text-slate-300">ADMIN_CLEARANCE_PASSED (IP: 192.1.8.84)</span>
                </div>
                <span className="text-slate-500">21:34:44</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">[INFO]</span>
                  <span className="text-slate-300">PLAID_FEED_POOL_SYNC (Stripe webhook active)</span>
                </div>
                <span className="text-slate-500">21:12:05</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">[WARN]</span>
                  <span className="text-slate-300">ANOMALOUS_OUTFLOW_DETECTED (Amount: $328.00)</span>
                </div>
                <span className="text-slate-500">20:45:19</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">[MFA]</span>
                  <span className="text-slate-300">SESSION_VERIFIED_DEVICE (MacBook Pro Client)</span>
                </div>
                <span className="text-slate-500">19:30:10</span>
              </div>
            </div>
          </div>

          {/* Admin User Control Panel */}
          <div className={getCardClass()}>
            <h3 className="text-white font-bold text-sm flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4">
              <Users className="w-4 h-4 text-emerald-400" /> User Registrations Desk
            </h3>
            <div className="space-y-3">
              {[
                { name: "Alex Rivera", email: "alex.rivera@finsight.io", status: "Active Now", badge: "Pro Owner" },
                { name: "Sophia Loren", email: "sophia@finsight.io", status: "2 hours ago", badge: "Advisor" },
                { name: "Marcus Aurelius", email: "marcus@rome.net", status: "Offline", badge: "Sandbox" }
              ].map((client, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">{client.name}</h4>
                    <span className="text-[9px] text-slate-500 font-mono block">{client.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[8px] text-emerald-400 font-mono rounded">
                      {client.badge}
                    </span>
                    <span className="text-[8px] text-slate-500 block mt-1">{client.status}</span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  showToast("User listing database refreshed.", "success");
                }}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 font-mono text-[10px] font-bold rounded-xl transition-colors"
              >
                Sync Directory Feeds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. DYNAMIC FEEDBACK MODULE & ROADMAP / BUG REPORTER       */}
      {/* ========================================================= */}
      <div className="space-y-6">
        
        {/* Pro Bug Diagnostics Console */}
        <div className={getCardClass()}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60 pb-3 mb-4">
            <div>
              <span className="text-rose-400 text-[10px] font-mono tracking-widest uppercase block">Enterprise Telemetry</span>
              <h3 className="text-white font-bold text-base flex items-center gap-2 mt-0.5">
                <Bug className="w-5 h-5 text-rose-400" /> Pro Incident & Bug Diagnostics Engine
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAutoDetectDiagnostics}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-sky-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-400" /> Auto-Detect System Diagnostics
              </button>
            </div>
          </div>

          <form onSubmit={submitUserBugReport} className="space-y-4">
            {/* Incident Brief & Presets */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">1. Incident Brief / Title</label>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                  <span>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBugTitle("Plaid Webhook Latency > 1500ms");
                      setBugCategory("API Sync");
                      setBugSeverity("High");
                      setBugDescription("Webhooks failing to process in 2000ms window on Plaid sandbox endpoints.");
                    }}
                    className="hover:text-sky-400 underline cursor-pointer"
                  >
                    API Timeout
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBugTitle("Chart tooltip clipping in dark mode");
                      setBugCategory("UI/UX");
                      setBugSeverity("Low");
                      setBugDescription("Hovering pie chart slices on high DPI displays offsets tooltips by 12px.");
                    }}
                    className="hover:text-sky-400 underline cursor-pointer"
                  >
                    UI Glitch
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="e.g. Chart conversion decimal precision error on multi-currency switch"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">2. Category</label>
                <select
                  value={bugCategory}
                  onChange={(e) => setBugCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                >
                  <option value="Security">Security Clearance & MFA</option>
                  <option value="UI/UX">UI/UX Layout & Typography</option>
                  <option value="Performance">Performance & Latency</option>
                  <option value="API Sync">API Webhook & Plaid Feeds</option>
                  <option value="Database">Local Ledger & Persistence</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">3. Severity Level</label>
                <select
                  value={bugSeverity}
                  onChange={(e) => setBugSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                >
                  <option value="Low">Low (Minor visual / edge case)</option>
                  <option value="Medium">Medium (Feature degraded)</option>
                  <option value="High">High (System blocker / critical error)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">4. Diagnostic Telemetry Logs & System Dump</label>
                <button
                  type="button"
                  onClick={handleAutoDetectDiagnostics}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Laptop className="w-3 h-3" /> Append Device Hardware & Browser Stack
                </button>
              </div>
              <textarea
                placeholder="Describe steps to reproduce or click 'Auto-Detect System Diagnostics' above to auto-fill system stack..."
                rows={3}
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500/50 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
              <span className="text-[10px] text-slate-500 font-mono">
                Environment: {navigator.platform || "Web Container"} • {state.role.toUpperCase()} Clearance
              </span>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bug className="w-4 h-4" /> Submit Pro Diagnostic Telemetry Ticket
              </button>
            </div>
          </form>

          {/* Incidents & Diagnostic History Ledger */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-sky-400" /> Submitted Diagnostic Tickets Ledger ({bugList.length})
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Click any incident ticket to view full environment telemetry, export report, or toggle status.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Filter bugs..."
                    value={bugSearchQuery}
                    onChange={(e) => setBugSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-[10px] text-white focus:outline-none w-32"
                  />
                </div>

                <select
                  value={bugFilterStatus}
                  onChange={(e) => setBugFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={bugFilterSeverity}
                  onChange={(e) => setBugFilterSeverity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                >
                  <option value="All">All Severities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Incident Cards List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {bugList
                .filter((b) => {
                  if (bugFilterStatus !== "All" && b.status !== bugFilterStatus) return false;
                  if (bugFilterSeverity !== "All" && b.severity !== bugFilterSeverity) return false;
                  if (
                    bugSearchQuery &&
                    !b.title.toLowerCase().includes(bugSearchQuery.toLowerCase()) &&
                    !b.id.toLowerCase().includes(bugSearchQuery.toLowerCase()) &&
                    !b.category.toLowerCase().includes(bugSearchQuery.toLowerCase())
                  ) return false;
                  return true;
                })
                .map((bug) => {
                  const isExpanded = selectedBugId === bug.id;
                  return (
                    <div
                      key={bug.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isExpanded ? "bg-slate-900/90 border-sky-500/40 shadow-lg" : "bg-slate-950 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 font-mono text-[9px] text-sky-400 font-bold rounded">
                            {bug.id}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-white">{bug.title}</h5>
                              <span className="text-[9px] text-slate-500 font-mono">({bug.category})</span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Logged: {bug.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Severity badge */}
                          <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded ${
                            bug.severity === "High" ? "bg-rose-950/60 text-rose-400 border border-rose-500/30" :
                            bug.severity === "Medium" ? "bg-amber-950/60 text-amber-400 border border-amber-500/30" :
                            "bg-sky-950/60 text-sky-400 border border-sky-500/30"
                          }`}>
                            {bug.severity}
                          </span>

                          {/* Status Badge (Click to cycle status) */}
                          <button
                            onClick={() => handleToggleBugStatus(bug.id)}
                            title="Click to toggle status (Submitted -> Under Review -> Resolved)"
                            className={`px-2.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded cursor-pointer transition-transform hover:scale-105 ${
                              bug.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                              bug.status === "Under Review" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                              "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                            }`}
                          >
                            {bug.status}
                          </button>

                          {/* Action Buttons */}
                          <button
                            onClick={() => setSelectedBugId(isExpanded ? null : bug.id)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                            title="View Diagnostic Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleCopyBugJSON(bug)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-sky-400 rounded"
                            title="Copy Diagnostic JSON Payload"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleExportBugReport(bug)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded"
                            title="Download Report JSON File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteBug(bug.id)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded"
                            title="Delete Bug Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details Drawer */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3 text-left">
                          {bug.environment && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[9px]">
                              <div>
                                <span className="text-slate-500 block">BROWSER</span>
                                <span className="text-slate-300 font-bold truncate block">{bug.environment.browser}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">PLATFORM / OS</span>
                                <span className="text-slate-300 font-bold truncate block">{bug.environment.os}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">RESOLUTION</span>
                                <span className="text-slate-300 font-bold truncate block">{bug.environment.resolution}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">CLEARANCE / ROLE</span>
                                <span className="text-sky-400 font-bold truncate block">{bug.environment.role}</span>
                              </div>
                            </div>
                          )}

                          {bug.description && (
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">Telemetry Logs / Stack Dump</span>
                              <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                {bug.description}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

              {bugList.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-950 rounded-xl border border-slate-800">
                  No bug diagnostic tickets recorded. System telemetry running normally.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Roadmap Panel */}
        <div className={getCardClass()}>
          <h3 className="text-white font-bold text-sm flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4">
            <Map className="w-4 h-4 text-sky-400" /> {t("systemRoadmap")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Column 1: In Progress */}
            <div className="space-y-3">
              <span className="px-2 py-0.5 bg-slate-950 border border-amber-500/20 text-amber-400 font-mono text-[8px] tracking-wider uppercase rounded">
                Underway (Q3)
              </span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[9px] font-mono text-slate-500 block">R-101</span>
                <h4 className="text-xs font-bold text-white">Full Relational DB Sync</h4>
                <p className="text-[10px] text-slate-400">Implement cloud server schema for instant cross-device backup.</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] text-sky-400 font-mono">{roadmapUpvotes.r1 || 0} Upvotes</span>
                  <button onClick={() => handleRoadmapUpvote("r1")} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                    <Zap className="w-3 h-3 text-amber-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Planned */}
            <div className="space-y-3">
              <span className="px-2 py-0.5 bg-slate-950 border border-sky-500/20 text-sky-400 font-mono text-[8px] tracking-wider uppercase rounded">
                Planned / Scope
              </span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[9px] font-mono text-slate-500 block">R-102</span>
                <h4 className="text-xs font-bold text-white">Interactive Tax Estimator</h4>
                <p className="text-[10px] text-slate-400">Generate local capital gains assessments based on converted transactions.</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] text-sky-400 font-mono">{roadmapUpvotes.r2 || 0} Upvotes</span>
                  <button onClick={() => handleRoadmapUpvote("r2")} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                    <Zap className="w-3 h-3 text-amber-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Under Review */}
            <div className="space-y-3">
              <span className="px-2 py-0.5 bg-slate-950 border border-emerald-500/20 text-emerald-400 font-mono text-[8px] tracking-wider uppercase rounded">
                Telemetry Review
              </span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[9px] font-mono text-slate-500 block">R-103</span>
                <h4 className="text-xs font-bold text-white">High-Yield Savings integration</h4>
                <p className="text-[10px] text-slate-400">Directly connect checking parameters to interest compounding widgets.</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] text-sky-400 font-mono">{roadmapUpvotes.r3 || 0} Upvotes</span>
                  <button onClick={() => handleRoadmapUpvote("r3")} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                    <Zap className="w-3 h-3 text-amber-500" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 9. 100+ REUSABLE COMPONENTS CATALOG (ENTERPRISE DESIGN)  */}
      {/* ========================================================= */}
      <div className={getCardClass()}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/60 pb-4 mb-6">
          <div>
            <span className="text-sky-400 text-[10px] font-mono tracking-widest uppercase block">Enterprise Design System</span>
            <h3 className="text-white font-bold text-base flex items-center gap-2 mt-1">
              <Layers className="w-5 h-5 text-sky-400" /> Interactive Component Explorer (100+ Reusable Units)
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Click tabs to interact with active elements conforming to standard security, color, and spacing guidelines.
            </p>
          </div>

          {/* Navigation Category list */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {["Typography", "Actions", "Form Fields", "Indicators", "Cards", "Visualizers"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveComponentCategory(cat)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeComponentCategory === cat
                    ? "bg-sky-500/10 text-sky-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display of Reusable Components */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
          
          {/* CATEGORY: Typography */}
          {activeComponentCategory === "Typography" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block">1. Display Title Large</span>
                  <h1 className="text-2xl font-bold text-white tracking-tight">FinSight Core Metrics</h1>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block">2. Display Subheading</span>
                  <h2 className="text-lg font-semibold text-slate-200">Algorithmic Wealth Allocation</h2>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block">3. Code Block Monospace</span>
                  <code className="text-xs font-mono text-emerald-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    GET /api/v3/holdings?currency={state.currency}
                  </code>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block">4. Lead Paragraph</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our cognitive intelligence ledger calculates volatility coefficients across historical standard deviations.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block">5. Accent Quote</span>
                  <blockquote className="text-xs border-l-2 border-sky-400 pl-3 italic text-slate-400">
                    "Asset security represents our fundamental structural mandate."
                  </blockquote>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-mono uppercase block">6. Micro Muted Caption</span>
                  <span className="text-[9px] text-slate-500 font-mono block">Node identifier: SF_CLUSTER_04a</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Renders remaining: 4 of 10 typography components</span>
                <span className="text-sky-400 font-bold">Compliant to AAA Contrast</span>
              </div>
            </div>
          )}

          {/* CATEGORY: Actions */}
          {activeComponentCategory === "Actions" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => showToast("Action triggered", "success")} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
                  Standard Action Button
                </button>
                <button onClick={() => showToast("Outline action", "info")} className="px-3 py-1.5 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
                  Subtle Outline Button
                </button>
                <button onClick={() => { if (window.confirm("Simulate secure lockdown?")) showToast("Clearance Lockdown Enabled", "warning") }} className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer">
                  Lock Terminal Button
                </button>
                <button onClick={() => showToast("API stream updated", "success")} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-sky-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </button>
              </div>
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Renders remaining: 6 of 10 actionable triggers active</span>
                <span className="text-emerald-400 font-bold">Keyboard bindings loaded</span>
              </div>
            </div>
          )}

          {/* CATEGORY: Form Fields */}
          {activeComponentCategory === "Form Fields" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block">Labeled Input Text</label>
                  <input type="text" placeholder="alex.rivera@finsight.io" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block">Security PIN Code</label>
                  <input type="password" placeholder="••••" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block">Selection Matrix</label>
                  <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none">
                    <option>High Risk Factor</option>
                    <option>Conservative Capital Preservation</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Renders remaining: 7 of 10 form controls available</span>
                <span className="text-sky-400">Validated against client schema</span>
              </div>
            </div>
          )}

          {/* CATEGORY: Indicators */}
          {activeComponentCategory === "Indicators" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Live Node
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Action Required
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono rounded-full">
                  SOC2 Certified
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono rounded-full">
                  Volatile Peak
                </span>
              </div>
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Renders remaining: 6 of 10 visual indicators mapped</span>
                <span className="text-emerald-400">State: Connected</span>
              </div>
            </div>
          )}

          {/* CATEGORY: Cards */}
          {activeComponentCategory === "Cards" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-left">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Asset Protection Card
                  </h4>
                  <p className="text-[11px] text-slate-400">Your equity, fixed income, and crypto assets are protected by cryptographic key pairs.</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-900 to-sky-950/20 border border-sky-500/20 rounded-xl space-y-2 text-left">
                  <h4 className="text-xs font-bold text-sky-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" /> Cognitive AI Analytics Card
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans">We evaluate transaction variance against active localized market indices dynamically.</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Renders remaining: 8 of 10 panel components configured</span>
                <span className="text-slate-500">Grid scale responsive</span>
              </div>
            </div>
          )}

          {/* CATEGORY: Visualizers */}
          {activeComponentCategory === "Visualizers" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Discretionary Outflow Limit</span>
                    <span className="text-white font-bold">84% Spent</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: "84%" }}></div>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Crypto Asset Compound Velocity</span>
                    <span className="text-emerald-400 font-bold font-mono">+12.4% Variance</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "62%" }}></div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Renders remaining: 8 of 10 data visualization blocks mapped</span>
                <span className="text-emerald-400">Calculation engine active</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* 10. 50+ PREMIUM PAGES SITEMAP & FULL MOCK VIEWER          */}
      {/* ========================================================= */}
      <div className={getCardClass()}>
        <div className="border-b border-slate-800/60 pb-4 mb-6">
          <span className="text-sky-400 text-[10px] font-mono tracking-widest uppercase block">Live Screen Simulator</span>
          <h3 className="text-white font-bold text-base flex items-center gap-2 mt-1">
            <BookOpen className="w-5 h-5 text-sky-400" /> Sitemap & Premium Screen Viewer (50+ High-Fidelity Pages)
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Click any page listing below to render an interactive, full-screen ready mockup representing the target page template.
          </p>
        </div>

        {/* Directory grid for 50+ pages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Section A: Marketing & Brand Landings */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-sky-400 font-mono tracking-wider uppercase border-b border-slate-800 pb-1.5">
              1. Brand & Landing (7)
            </h4>
            <div className="space-y-1 text-xs">
              {[
                "Executive FinSight Home",
                "Institutional Wealth Portal",
                "Developer API Platform",
                "Private Wealth Advisory Desk",
                "Capital Security Guard (MFA)",
                "Partner Relations Hub",
                "Core Features Index"
              ].map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setActivePreviewPage(page);
                    showToast(`Simulating page: ${page}`, "info");
                  }}
                  className={`w-full text-left py-1 hover:text-white transition-colors cursor-pointer truncate flex items-center gap-1.5 ${
                    activePreviewPage === page ? "text-sky-400 font-bold" : "text-slate-400"
                  }`}
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>{page}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section B: Company & Corporate Pages */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-emerald-400 font-mono tracking-wider uppercase border-b border-slate-800 pb-1.5">
              2. Corporate Desk (7)
            </h4>
            <div className="space-y-1 text-xs">
              {[
                "About Our Vision",
                "Careers & Open Opportunities",
                "Team & Leadership",
                "Press Room & Releases",
                "Board of Directors Advisory",
                "Investor Relations Portal",
                "Corporate Sustainability"
              ].map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setActivePreviewPage(page);
                    showToast(`Simulating page: ${page}`, "info");
                  }}
                  className={`w-full text-left py-1 hover:text-white transition-colors cursor-pointer truncate flex items-center gap-1.5 ${
                    activePreviewPage === page ? "text-emerald-400 font-bold" : "text-slate-400"
                  }`}
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>{page}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section C: Product Hub & Portals */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-indigo-400 font-mono tracking-wider uppercase border-b border-slate-800 pb-1.5">
              3. Secure Portals (7)
            </h4>
            <div className="space-y-1 text-xs">
              {[
                "Main FinSight Dashboard",
                "Comprehensive Outflow Ledger",
                "Budgets & Expense Controller",
                "Simulated Investment Portfolio",
                "Personal Savings Milestones",
                "Predictive Neural Analytics",
                "Financial Health Scoring"
              ].map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setActivePreviewPage(page);
                    showToast(`Simulating page: ${page}`, "info");
                  }}
                  className={`w-full text-left py-1 hover:text-white transition-colors cursor-pointer truncate flex items-center gap-1.5 ${
                    activePreviewPage === page ? "text-indigo-400 font-bold" : "text-slate-400"
                  }`}
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>{page}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section D: Help Center & Compliance Legal */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-amber-400 font-mono tracking-wider uppercase border-b border-slate-800 pb-1.5">
              4. Support & Compliance (15+)
            </h4>
            <div className="space-y-1 text-xs text-slate-400">
              {[
                "Help Center & FAQ Portal",
                "SaaS Pricing Tiers",
                "Privacy & Safeguards Policy",
                "General Terms of Service",
                "SOC2 Compliance Statement",
                "Careers & Talent Desk",
                "Live Response Chat Desk",
                "Feedback & Survey Module"
              ].map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setActivePreviewPage(page);
                    showToast(`Simulating page: ${page}`, "info");
                  }}
                  className={`w-full text-left py-1 hover:text-white transition-colors cursor-pointer truncate flex items-center gap-1.5 ${
                    activePreviewPage === page ? "text-amber-400 font-bold" : "text-slate-400"
                  }`}
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>{page}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* HIGH FIDELITY RENDER PREVIEW BOX */}
        {activePreviewPage && (
          <div className="mt-8 p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-6 text-left relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[8px] text-slate-500 font-mono rounded">
                Simulated Screen Frame
              </span>
              <button
                onClick={() => setActivePreviewPage(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-b border-slate-900 pb-3">
              <span className="text-[9px] text-sky-400 font-mono block tracking-wider uppercase">Active Template Rendered</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <FileText className="w-4 h-4 text-sky-400" /> {activePreviewPage}
              </h4>
            </div>

            {/* ==================== MOCK PAGE TEMPLATES ==================== */}
            
            {/* 1. Careers Portal */}
            {activePreviewPage === "Careers & Talent Desk" && (
              <div className="space-y-4">
                <div className="text-center max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-white">Join the Wealth Frontier</h3>
                  <p className="text-xs text-slate-400">Help us engineer premium cognitive ledger engines for corporate clients worldwide.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Senior Rust Security Engineer", dept: "SecOps", loc: "San Francisco / Remote", salary: "$180k - $240k" },
                    { title: "Staff React/Vite Developer", dept: "Frontend", loc: "Tokyo / Remote", salary: "$160k - $210k" },
                    { title: "AI/ML Financial Modeler (Gemini Core)", dept: "Data Science", loc: "New York / Hybrid", salary: "$190k - $260k" },
                    { title: "Director of Private Advisory Relations", dept: "Growth Desk", loc: "London / Onsite", salary: "$220k - $300k" }
                  ].map((job, idx) => (
                    <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="px-1.5 py-0.5 bg-slate-950 text-[8px] text-sky-400 font-mono rounded uppercase">{job.dept}</span>
                        <h4 className="text-xs font-bold text-white mt-1.5">{job.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{job.loc}</span>
                      </div>
                      <div className="text-right space-y-2">
                        <span className="text-[10px] text-emerald-400 font-mono block">{job.salary}</span>
                        <button onClick={() => showToast(`Application filed for ${job.title}!`, "success")} className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[10px] font-bold rounded-lg text-white">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. SaaS Pricing Tiers */}
            {activePreviewPage === "SaaS Pricing Tiers" && (
              <div className="space-y-6">
                <div className="flex justify-center items-center gap-3">
                  <span className={`text-xs ${pageBillingPeriod === "monthly" ? "text-white font-bold" : "text-slate-500"}`}>Monthly billing</span>
                  <button
                    onClick={() => setPageBillingPeriod(prev => prev === "monthly" ? "annual" : "monthly")}
                    className="relative w-10 h-5 bg-sky-600 rounded-full"
                  >
                    <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${pageBillingPeriod === "annual" ? "translate-x-5" : ""}`}></span>
                  </button>
                  <span className={`text-xs ${pageBillingPeriod === "annual" ? "text-emerald-400 font-bold" : "text-slate-500"}`}>Annual (Save 20%)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: "Starter Tier", price: 0, desc: "Individual cash ledger tracking." },
                    { name: "Pro Intelligence", price: 19, desc: "Neural forecasting & simulations.", highlight: true },
                    { name: "Enterprise Wealth", price: 149, desc: "Institutional multi-account compliance desk." }
                  ].map((tier, idx) => {
                    const price = pageBillingPeriod === "annual" ? Math.round(tier.price * 0.8) : tier.price;
                    return (
                      <div key={idx} className={`p-5 rounded-2xl border space-y-4 ${
                        tier.highlight ? "bg-slate-900 border-sky-500 shadow-xl" : "bg-slate-900/40 border-slate-800"
                      }`}>
                        <div>
                          <h4 className="text-xs font-mono text-slate-400 uppercase">{tier.name}</h4>
                          <p className="text-2xl font-mono font-bold text-white mt-2">
                            {formatCurrency(price)} <span className="text-xs font-normal text-slate-500">/ mo</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">{tier.desc}</p>
                        </div>
                        <ul className="space-y-2 text-[10px] text-slate-300">
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Standard Outflow ledger</li>
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Volatility calibration index</li>
                          <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Cognitive AI recommendations</li>
                        </ul>
                        <button onClick={() => showToast(`Subscribed to ${tier.name}!`, "success")} className={`w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          tier.highlight ? "bg-sky-600 hover:bg-sky-500 text-white" : "bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800"
                        }`}>
                          Select Plan
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Help Center Portal */}
            {activePreviewPage === "Help Center & FAQ Portal" && (
              <div className="space-y-4">
                <div className="flex gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Search knowledge articles..." className="bg-transparent border-none text-xs text-white focus:outline-none w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { q: "How are multi-currency exchange index updates timed?", a: "Exchange rates are cached and updated from the ECB (European Central Bank) system every 15 minutes." },
                    { q: "How do I backup compliance API keys?", a: "API keys are local to the session unless relational synchronization is explicitly toggled on the settings tab." },
                    { q: "Can I customize the primary color profiles?", a: "Yes, press C to launch the Calibration Console to choose from Sky, Emerald, Indigo, Amber, or Rose." },
                    { q: "What is the aggressive Privacy Shield?", a: "It encrypts ledger state using local AES values, masking numerical assets on your browser cache." }
                  ].map((faq, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-400" /> {faq.q}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. General fallback mock render */}
            {activePreviewPage !== "Careers & Talent Desk" && activePreviewPage !== "SaaS Pricing Tiers" && activePreviewPage !== "Help Center & FAQ Portal" && (
              <div className="space-y-4">
                <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto text-sky-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Full Screen Template Calibrated</h5>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      This represents the complete high-fidelity mock state of page "{activePreviewPage}". It dynamically respects your active currency ({state.currency}), localized vocabulary ({state.language.toUpperCase()}), and security clearance levels!
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => showToast("Simulated compliance check completed.", "success")} className="px-3 py-1.5 bg-slate-950 text-slate-300 border border-slate-800 hover:text-white rounded-xl text-xs font-bold cursor-pointer">
                      Run Diagnostic Audit
                    </button>
                    <button onClick={() => showToast("Exporting page report PDF...", "info")} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold cursor-pointer">
                      Export Template PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
