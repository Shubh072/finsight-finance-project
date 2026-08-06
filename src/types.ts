export interface Expense {
  id: string;
  date: string;
  category: string;
  merchant: string;
  amount: number;
  status: 'Cleared' | 'Pending' | 'Flagged';
  notes?: string;
  tags?: string[];
  paymentMethod?: string;
  location?: string;
  isOffline?: boolean;
  isRecurring?: boolean;
  frequency?: 'Daily' | 'Weekly' | 'Monthly';
  attachments?: string[];
  approvalStatus?: 'Draft' | 'Submitted' | 'Pending' | 'Approved' | 'Cleared' | 'Rejected';
  approver?: string;
  approverNotes?: string;
  originalCurrency?: string;
  originalAmount?: number;
  exchangeRate?: number;
  splitWith?: { name: string; share: number; paid: boolean }[];
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'Emergency Fund' | 'Retirement' | 'Car' | 'House' | 'Wedding' | 'Education' | 'Travel' | 'Business' | 'Vacation' | 'Laptop' | 'Phone' | 'Custom Goal' | 'Housing' | 'Emergency' | 'Other';
  status: 'On Track' | 'At Risk' | 'Achieved';
  priority?: 'Low' | 'Medium' | 'High';
  milestones?: { id: string; name: string; amount: number; achieved: boolean }[];
  monthlyContribution?: number;
  isFamily?: boolean;
  familyMembers?: string[];
  isShared?: boolean;
  sharedWith?: string[];
  inflationRate?: number;
  expectedRateOfReturn?: number;
  badges?: string[];
  reminders?: {
    id: string;
    text: string;
    date: string;
    alertType?: 'milestone' | 'deadline' | 'custom' | 'sweep' | 'velocity';
    thresholdPercent?: number;
    targetValue?: number;
    status?: 'active' | 'triggered' | 'disabled';
    lastTriggeredAt?: string;
  }[];
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  type: 'Stock' | 'ETF' | 'Mutual Fund' | 'Crypto' | 'Gold' | 'Silver' | 'Fixed Deposit' | 'PPF' | 'Bonds' | 'NPS' | 'Real Estate' | 'Equity' | 'Fixed Income' | 'Cash';
  category?: string; // Sector/category e.g., Tech, Finance, Precious Metals
  dayChangePercent?: number; // Daily percentage change
  dividendYield?: number; // Annual yield
  notes?: string; // Connected notes/journals
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  data?: any; // To pass tables/charts data
}

export interface ChatThread {
  id: string;
  title: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  monthlyGoal: number;
  currency: string;
  defaultAccount: string;
  username?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePhoto?: string;
  createdAt?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  apiKeyEnabled: boolean;
  backupCodesCount: number;
  activeSessions: {
    id: string;
    device: string;
    ip: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  aiSummaries: boolean;
}

export function safeParseJSON<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString || jsonString === "undefined" || jsonString === "null") {
    return fallback;
  }
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn("Failed to parse JSON string:", jsonString, error);
    return fallback;
  }
}
