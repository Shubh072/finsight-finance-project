import React from "react";
import { 
  Plus, Target, Calendar, Trash2, Edit2, AlertCircle, CheckCircle, Clock, X, Sparkles, 
  Award, Shield, Home, Heart, GraduationCap, Briefcase, Car, Compass, Palmtree, Laptop, 
  Smartphone, HelpCircle, Users, Share2, Sliders, TrendingUp, Info, Bell, Calculator, 
  AlertTriangle, Play, Check, RefreshCw, Trash, UserPlus, Star, ArrowUpRight, Search, SlidersHorizontal, Mail
} from "lucide-react";
import { Goal, UserProfile } from "../types";
import { getCurrencySymbol, getCurrencyRate, formatCurrency } from "../utils/currency";
import { dispatchDynamicNotification } from "../utils/notifDispatcher";

interface GoalsTabProps {
  goals: Goal[];
  userProfile?: UserProfile;
  onAddGoal: (goal: Omit<Goal, "id">) => void;
  onEditGoal: (id: string, updated: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  insights: any;
  isLoadingInsights: boolean;
}

// 12 Premium Goal Types and Categories config
export const GOAL_TYPES = [
  { value: "Emergency Fund", label: "Emergency Fund", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { value: "Retirement", label: "Retirement Fund", icon: LandmarkIcon, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { value: "Car", label: "Vehicle Purchase", icon: Car, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { value: "House", label: "Property / House", icon: Home, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { value: "Wedding", label: "Wedding", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { value: "Education", label: "Education / College", icon: GraduationCap, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { value: "Travel", label: "Travel / Adventure", icon: Compass, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { value: "Business", label: "Business / Startup", icon: Briefcase, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  { value: "Vacation", label: "Vacation Fund", icon: Palmtree, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { value: "Laptop", label: "Tech / Laptop", icon: Laptop, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { value: "Phone", label: "Mobile / Phone", icon: Smartphone, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { value: "Custom Goal", label: "Custom Goal", icon: Target, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" }
];

// Helper fallback for older categories
function LandmarkIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 2 7 22 7 12 2" />
    </svg>
  );
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  goals,
  userProfile,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  insights,
  isLoadingInsights,
}) => {
  const currencySymbol = getCurrencySymbol(userProfile?.currency);
  const currencyRate = getCurrencyRate(userProfile?.currency);
  // Navigation tabs for sub-features inside Goal Module
  const [activeSubTab, setActiveSubTab] = React.useState<"dashboard" | "simulator" | "analytics" | "family">("dashboard");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>("All");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = React.useState<string>("All");

  // Selected Goal for focused analysis & simulation
  const [selectedGoalId, setSelectedGoalId] = React.useState<string>(() => {
    return goals[0]?.id || "";
  });

  // Ensure selected goal remains valid
  React.useEffect(() => {
    if (goals.length > 0 && !goals.some(g => g.id === selectedGoalId)) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  const activeGoal = goals.find(g => g.id === selectedGoalId) || goals[0];

  // Forms State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: new Date().toISOString().split("T")[0],
    category: "Emergency Fund" as Goal['category'],
    status: "On Track" as Goal['status'],
    priority: "High" as Goal['priority'],
    monthlyContribution: "500",
    expectedRateOfReturn: "8",
    inflationRate: "3",
    isFamily: false,
    familyMembersString: "",
    isShared: false,
    sharedWithString: ""
  });

  // Interactive Goal Simulation sliders (What-if calculator)
  const [simExtraSavings, setSimExtraSavings] = React.useState<number>(150);
  const [simExtraYield, setSimExtraYield] = React.useState<number>(0);
  const [simInflationToggle, setSimInflationToggle] = React.useState<boolean>(true);

  // New Milestone Form
  const [newMilestoneName, setNewMilestoneName] = React.useState("");
  const [newMilestoneAmount, setNewMilestoneAmount] = React.useState("");

  // New Reminder & Dynamic Target Rule Form
  const [newReminderText, setNewReminderText] = React.useState("");
  const [newReminderDate, setNewReminderDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [newAlertType, setNewAlertType] = React.useState<'milestone' | 'deadline' | 'custom' | 'sweep' | 'velocity'>('milestone');
  const [newAlertThreshold, setNewAlertThreshold] = React.useState("50");
  const [isScanningTargets, setIsScanningTargets] = React.useState(false);

  // Circle Contributor Email State
  const [contributorEmail, setContributorEmail] = React.useState("");

  // Auto evaluate dynamic target alerts on initial mount
  React.useEffect(() => {
    if (goals && goals.length > 0) {
      scanAndEvaluateAllGoals();
    }
  }, []);
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: "success" | "info" | "warning" }[]>([]);
  const triggerToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = "g_toast_" + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Dispatch email to financial adviser
  const sendGoalEmailToAdviser = async (goal: Omit<Goal, "id"> | Goal, emails: string[]) => {
    if (!emails || emails.length === 0) return;
    try {
      const res = await fetch("/api/goals/share-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails,
          goal,
          userName: userProfile?.name || "FinSight Client",
          userEmail: userProfile?.email || "client@finsight.io"
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Advisory goal report emailed to ${emails.join(", ")}!`, "success");
      } else {
        triggerToast(data.error || "Could not send email to advisor", "warning");
      }
    } catch (err: any) {
      console.error("Failed to dispatch advisor email:", err);
      triggerToast("Goal saved, but email service encountered a network error.", "warning");
    }
  };

  // Dispatch co-saving invitation email
  const sendContributorInvite = async (email: string) => {
    if (!email || !email.includes("@")) {
      triggerToast("Please provide a valid recipient email address", "warning");
      return;
    }
    try {
      const res = await fetch("/api/goals/share-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: [email],
          action: "contributor_invite",
          userName: userProfile?.name || "FinSight Client",
          userEmail: userProfile?.email || "client@finsight.io"
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Co-saving invitation successfully emailed to ${email}!`, "success");
        setContributorEmail("");
      } else {
        triggerToast(data.error || "Failed to send invitation email", "warning");
      }
    } catch (err: any) {
      console.error("Failed to send contributor invitation:", err);
      triggerToast("Failed to send invitation email.", "warning");
    }
  };

  // Get matching icon and color for each category
  const getCategoryConfig = (cat: string) => {
    const match = GOAL_TYPES.find(t => t.value === cat);
    if (match) return match;
    // Map older fallback categories
    if (cat === "Housing" || cat === "House") {
      return GOAL_TYPES.find(t => t.value === "House") || GOAL_TYPES[11];
    }
    if (cat === "Emergency") {
      return GOAL_TYPES.find(t => t.value === "Emergency Fund") || GOAL_TYPES[11];
    }
    return GOAL_TYPES[11]; // Custom Goal icon
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      targetDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 years out
      category: "Emergency Fund",
      status: "On Track",
      priority: "Medium",
      monthlyContribution: "350",
      expectedRateOfReturn: "7",
      inflationRate: "3",
      isFamily: false,
      familyMembersString: "",
      isShared: false,
      sharedWithString: ""
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (g: Goal) => {
    setEditingId(g.id);
    setFormData({
      name: g.name,
      targetAmount: g.targetAmount.toString(),
      currentAmount: g.currentAmount.toString(),
      targetDate: g.targetDate,
      category: g.category,
      status: g.status,
      priority: g.priority || "Medium",
      monthlyContribution: (g.monthlyContribution || 250).toString(),
      expectedRateOfReturn: (g.expectedRateOfReturn || 6).toString(),
      inflationRate: (g.inflationRate || 3).toString(),
      isFamily: !!g.isFamily,
      familyMembersString: g.familyMembers ? g.familyMembers.join(", ") : "",
      isShared: !!g.isShared,
      sharedWithString: g.sharedWith ? g.sharedWith.join(", ") : ""
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.currentAmount) {
      triggerToast("Please provide all required goal criteria", "warning");
      return;
    }

    const members = formData.familyMembersString
      ? formData.familyMembersString.split(",").map(m => m.trim()).filter(m => m.length > 0)
      : undefined;

    const shares = formData.sharedWithString
      ? formData.sharedWithString.split(",").map(m => m.trim()).filter(m => m.length > 0)
      : undefined;

    // Smart initial milestones if brand new and none exist
    const defaultMilestones = !editingId ? [
      { id: "m_" + Date.now() + "_1", name: "Launch deposit of 10%", amount: Math.round(parseFloat(formData.targetAmount) * 0.10), achieved: parseFloat(formData.currentAmount) >= parseFloat(formData.targetAmount) * 0.10 },
      { id: "m_" + Date.now() + "_2", name: "Accumulated Halfway Mark", amount: Math.round(parseFloat(formData.targetAmount) * 0.50), achieved: parseFloat(formData.currentAmount) >= parseFloat(formData.targetAmount) * 0.50 },
    ] : undefined;

    const payload: Omit<Goal, "id"> = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      targetDate: formData.targetDate,
      category: formData.category,
      status: formData.status,
      priority: formData.priority,
      monthlyContribution: parseFloat(formData.monthlyContribution) || 200,
      expectedRateOfReturn: parseFloat(formData.expectedRateOfReturn) || 6,
      inflationRate: parseFloat(formData.inflationRate) || 3,
      isFamily: formData.isFamily,
      familyMembers: members,
      isShared: formData.isShared,
      sharedWith: shares,
      badges: editingId ? (goals.find(g => g.id === editingId)?.badges || []) : ["Goal Begun"],
      milestones: editingId ? (goals.find(g => g.id === editingId)?.milestones || []) : defaultMilestones,
      reminders: editingId ? (goals.find(g => g.id === editingId)?.reminders || []) : [
        { id: "rem_" + Date.now(), text: `Keep up consistent saving for ${formData.name}!`, date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }
      ]
    };

    if (editingId) {
      onEditGoal(editingId, payload);
      triggerToast("Goal metadata updated successfully!", "success");
    } else {
      onAddGoal(payload);
      triggerToast("Intelligent savings goal registered!", "success");
    }

    if (formData.isShared && shares && shares.length > 0) {
      sendGoalEmailToAdviser(payload, shares);
    }

    setIsFormOpen(false);
  };

  // Milestone toggling
  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal || !targetGoal.milestones) return;

    const updatedMilestones = targetGoal.milestones.map(m => {
      if (m.id === milestoneId) {
        const nextAchieved = !m.achieved;
        // Adjust currentAmount if milestone achieved and user desires (visual simulated effect)
        let amountDelta = 0;
        if (nextAchieved) {
          triggerToast(`Milestone Unlocked: '${m.name}' (+ $${m.amount})`, "success");
        }
        return { ...m, achieved: nextAchieved };
      }
      return m;
    });

    // Check for badge updates based on milestone achievements
    const achievedCount = updatedMilestones.filter(m => m.achieved).length;
    let newBadges = [...(targetGoal.badges || [])];
    if (achievedCount === updatedMilestones.length && !newBadges.includes("Milestone Crusher")) {
      newBadges.push("Milestone Crusher");
      triggerToast("Achievement Badges Unlocked: 'Milestone Crusher'!", "success");
    }

    onEditGoal(goalId, {
      milestones: updatedMilestones,
      badges: newBadges
    });
  };

  // Add customized Milestone
  const handleAddMilestone = (goalId: string) => {
    if (!newMilestoneName.trim() || !newMilestoneAmount.trim()) {
      triggerToast("Provide a valid milestone name and target amount", "warning");
      return;
    }
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const amount = parseFloat(newMilestoneAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newM = {
      id: "m_cust_" + Date.now(),
      name: newMilestoneName.trim(),
      amount,
      achieved: targetGoal.currentAmount >= amount
    };

    const currentM = targetGoal.milestones || [];
    onEditGoal(goalId, {
      milestones: [...currentM, newM]
    });

    setNewMilestoneName("");
    setNewMilestoneAmount("");
    triggerToast(`Added custom milestone: '${newM.name}'`, "success");
  };

  // Remove milestone
  const handleDeleteMilestone = (goalId: string, milestoneId: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal || !targetGoal.milestones) return;

    const filtered = targetGoal.milestones.filter(m => m.id !== milestoneId);
    onEditGoal(goalId, { milestones: filtered });
    triggerToast("Milestone milestone removed", "info");
  };

  // Dynamic Target Evaluation Engine
  const scanAndEvaluateAllGoals = (manualGoalId?: string) => {
    setIsScanningTargets(true);
    let totalAlertsDispatched = 0;

    const goalsToScan = manualGoalId ? goals.filter(g => g.id === manualGoalId) : goals;

    goalsToScan.forEach((goal) => {
      const progressPercent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const formattedCurrent = formatCurrency(goal.currentAmount * currencyRate, currencySymbol);
      const formattedTarget = formatCurrency(goal.targetAmount * currencyRate, currencySymbol);

      // 1. Automatic Milestone Threshold Checks
      const milestonesToCheck = [
        { pct: 25, title: `🎯 25% Goal Milestone: ${goal.name}`, desc: `Progress update: You have saved ${formattedCurrent} towards your ${goal.name} target (${formattedTarget}).` },
        { pct: 50, title: `🎯 Halfway Milestone (50%): ${goal.name}`, desc: `Awesome! You reached 50% (${formattedCurrent}) of your ${goal.name} target!` },
        { pct: 75, title: `🚀 75% Milestone Achieved: ${goal.name}`, desc: `Final stretch! ${formattedCurrent} accumulated towards ${goal.name}.` },
        { pct: 100, title: `🎉 Target Achieved: ${goal.name} Complete!`, desc: `Congratulations! Goal ${goal.name} is 100% funded at ${formattedCurrent}.` }
      ];

      milestonesToCheck.forEach((m) => {
        if (progressPercent >= m.pct) {
          const ruleId = `notif-goal-${goal.id}-pct-${m.pct}`;
          const result = dispatchDynamicNotification({
            id: ruleId,
            type: "goal",
            title: m.title,
            desc: m.desc,
            priority: m.pct >= 100 ? "high" : m.pct >= 50 ? "medium" : "low",
            category: "Financial Status",
            actionText: "View Goal Target",
            actionType: "view"
          });
          if (result) totalAlertsDispatched++;
        }
      });

      // 2. Deadline Proximity Check
      if (goal.targetDate) {
        const targetMs = new Date(goal.targetDate).getTime();
        const diffDays = Math.ceil((targetMs - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 30 && progressPercent < 80) {
          const ruleId = `notif-goal-${goal.id}-deadline-30d`;
          const result = dispatchDynamicNotification({
            id: ruleId,
            type: "goal",
            title: `⏱️ Deadline Warning: ${goal.name}`,
            desc: `${goal.name} target date is in ${diffDays} days! Current progress is ${progressPercent.toFixed(1)}% (${formattedCurrent}).`,
            priority: "high",
            category: "Reminders & Autopay",
            actionText: "Review Goal Pacing",
            actionType: "rebalance"
          });
          if (result) totalAlertsDispatched++;
        }
      }

      // 3. Custom Alert Rules Evaluation from goal.reminders
      if (goal.reminders && goal.reminders.length > 0) {
        let updatedReminders = [...goal.reminders];
        let remindersChanged = false;

        updatedReminders = updatedReminders.map((rem) => {
          let shouldTrigger = false;
          let triggerMessage = rem.text;

          if (rem.alertType === "milestone" && rem.thresholdPercent) {
            if (progressPercent >= rem.thresholdPercent) {
              shouldTrigger = true;
              triggerMessage = `🎯 Milestone Rule Matched: ${goal.name} reached ${rem.thresholdPercent}% (${formattedCurrent})`;
            }
          } else if (rem.alertType === "custom" && rem.targetValue) {
            if (goal.currentAmount >= rem.targetValue) {
              shouldTrigger = true;
              triggerMessage = `💰 Target Value Matched: ${goal.name} saved balance reached ${formatCurrency(rem.targetValue * currencyRate, currencySymbol)}`;
            }
          } else if (rem.status === "active" && !rem.alertType) {
            shouldTrigger = true;
          }

          if (shouldTrigger && rem.status !== "triggered") {
            dispatchDynamicNotification({
              id: `notif-rule-${rem.id}`,
              type: "goal",
              title: `🔔 Target Alert Rule: ${goal.name}`,
              desc: triggerMessage,
              priority: "high",
              category: "Financial Status",
              actionText: "Open Goal Target",
              actionType: "view"
            });
            totalAlertsDispatched++;
            remindersChanged = true;
            return {
              ...rem,
              status: "triggered" as const,
              lastTriggeredAt: new Date().toLocaleTimeString()
            };
          }
          return rem;
        });

        if (remindersChanged) {
          onEditGoal(goal.id, { reminders: updatedReminders });
        }
      }
    });

    setTimeout(() => {
      setIsScanningTargets(false);
      if (totalAlertsDispatched > 0) {
        triggerToast(`Evaluated target rules: Dispatched ${totalAlertsDispatched} live alert notifications!`, "success");
      } else {
        triggerToast("Target evaluation complete. Goal alert rules & milestones active.", "info");
      }
    }, 600);
  };

  // Add Dynamic Target Rule or Custom Alert
  const handleAddDynamicRule = (goalId: string, customText?: string, customType?: Goal['reminders'][0]['alertType'], customVal?: number) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const ruleType = customType || newAlertType;
    const thresholdVal = customVal !== undefined ? customVal : parseFloat(newAlertThreshold) || 50;

    let defaultText = "";
    if (ruleType === "milestone") {
      defaultText = `🎯 Trigger alert when saved reaches ${thresholdVal}% of target`;
    } else if (ruleType === "custom") {
      defaultText = `💰 Trigger alert when balance reaches ${formatCurrency(thresholdVal * currencyRate, currencySymbol)}`;
    } else if (ruleType === "deadline") {
      defaultText = `⏱️ Trigger alert 30 days before deadline (${targetGoal.targetDate || "Target Date"})`;
    } else if (ruleType === "velocity") {
      defaultText = `⚡ Alert if monthly savings velocity drops below required rate`;
    } else {
      defaultText = customText || newReminderText || "Calendar alert reminder";
    }

    const newRule = {
      id: "rem_rule_" + Date.now(),
      text: customText || defaultText,
      date: new Date().toISOString().split("T")[0],
      alertType: ruleType,
      thresholdPercent: ruleType === "milestone" ? thresholdVal : undefined,
      targetValue: ruleType === "custom" ? thresholdVal : undefined,
      status: "active" as const
    };

    const currentRules = targetGoal.reminders || [];
    onEditGoal(goalId, {
      reminders: [...currentRules, newRule]
    });

    setNewReminderText("");
    triggerToast(`Dynamic target rule registered: "${newRule.text}"`, "success");

    // Immediately test evaluate rule
    setTimeout(() => {
      scanAndEvaluateAllGoals(goalId);
    }, 300);
  };

  // Fire Live Test Alert
  const handleFireTestAlert = (goal: Goal, rem: NonNullable<Goal['reminders']>[0]) => {
    const formattedCurrent = formatCurrency(goal.currentAmount * currencyRate, currencySymbol);
    const item = dispatchDynamicNotification({
      id: `notif-test-${rem.id}-${Date.now()}`,
      type: "goal",
      title: `⚡ Live Target Alert Fired: ${goal.name}`,
      desc: `Rule execution check: "${rem.text}". Current target balance: ${formattedCurrent}.`,
      priority: "high",
      category: "Financial Status",
      actionText: "Audit Goal Target",
      actionType: "view"
    });

    const updated = (goal.reminders || []).map(r => r.id === rem.id ? { ...r, status: "triggered" as const, lastTriggeredAt: new Date().toLocaleTimeString() } : r);
    onEditGoal(goal.id, { reminders: updated });

    if (item) {
      triggerToast(`Live target alert fired & pushed to Notifications feed!`, "success");
    }

    if (goal.isShared && goal.sharedWith && goal.sharedWith.length > 0) {
      sendGoalEmailToAdviser(goal, goal.sharedWith);
    }
  };

  // Legacy handleAddReminder wrapper
  const handleAddReminder = (goalId: string) => {
    if (!newReminderText.trim()) {
      triggerToast("Reminder description cannot be empty", "warning");
      return;
    }
    handleAddDynamicRule(goalId, newReminderText.trim(), "custom");
  };

  // Delete Reminder / Rule
  const handleDeleteReminder = (goalId: string, reminderId: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal || !targetGoal.reminders) return;

    const filtered = targetGoal.reminders.filter(r => r.id !== reminderId);
    onEditGoal(goalId, { reminders: filtered });
    triggerToast("Target alert rule removed", "info");
  };

  // Calculation Engines
  const calculateGoalAnalytics = (g: Goal, simContributionOffset = 0, simYieldOffset = 0) => {
    if (!g) return {
      inflatedTarget: 0,
      remainingAmount: 0,
      requiredMonthly: 0,
      actualMonthsToGoal: 0,
      projectedDate: "Unknown",
      compoundInterestEarned: 0,
      recommendedMonthly: 0
    };

    const targetAmount = g.targetAmount;
    const currentAmount = g.currentAmount;
    const monthlySaved = (g.monthlyContribution || 300) + simContributionOffset;
    const rateOfReturn = ((g.expectedRateOfReturn || 7) + simYieldOffset) / 100;
    const inflationRate = (g.inflationRate || 3) / 100;

    // Time difference in years & months
    const targetDate = new Date(g.targetDate);
    const currentDate = new Date();
    const totalMonthsLeft = Math.max(1, 
      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
      (targetDate.getMonth() - currentDate.getMonth())
    );
    const yearsLeft = totalMonthsLeft / 12;

    // Inflation Adjusted Target cost
    const inflatedTarget = simInflationToggle
      ? Math.round(targetAmount * Math.pow(1 + inflationRate, yearsLeft))
      : targetAmount;

    const remainingAmount = Math.max(0, inflatedTarget - currentAmount);

    // Required monthly savings to hit inflated target with simple monthly compounding
    // Future Value of Annuity = PMT * [((1 + r/12)^n - 1) / (r/12)]
    // Solving for PMT...
    let requiredMonthly = remainingAmount / totalMonthsLeft; // simple baseline
    if (rateOfReturn > 0) {
      const r_monthly = rateOfReturn / 12;
      const numerator = remainingAmount * r_monthly;
      const denominator = Math.pow(1 + r_monthly, totalMonthsLeft) - 1;
      requiredMonthly = denominator > 0 ? numerator / denominator : requiredMonthly;
    }
    requiredMonthly = Math.round(requiredMonthly);

    // Recommended monthly is often required monthly + 15% safety buffer
    const recommendedMonthly = Math.round(requiredMonthly * 1.15);

    // Dynamic actual month path with current monthly contribution speed
    let actualMonthsToGoal = totalMonthsLeft;
    if (monthlySaved > 0) {
      if (rateOfReturn > 0) {
        const r_monthly = rateOfReturn / 12;
        // Solving for n: FutureValue = Current * (1+r_m)^n + PMT * [((1+r_m)^n - 1)/r_m]
        // InflatedTarget = Current * (1+r_m)^n + PMT/r_m * (1+r_m)^n - PMT/r_m
        // InflatedTarget + PMT/r_m = (Current + PMT/r_m) * (1+r_m)^n
        // (1+r_m)^n = (InflatedTarget + PMT/r_m) / (Current + PMT/r_m)
        // n = log((InflatedTarget + PMT/r_m) / (Current + PMT/r_m)) / log(1 + r_m)
        const numeratorVal = inflatedTarget + (monthlySaved / r_monthly);
        const denominatorVal = currentAmount + (monthlySaved / r_monthly);
        if (denominatorVal > 0 && numeratorVal > denominatorVal) {
          const ratio = numeratorVal / denominatorVal;
          const monthsNum = Math.log(ratio) / Math.log(1 + r_monthly);
          actualMonthsToGoal = !isNaN(monthsNum) && isFinite(monthsNum) ? Math.ceil(monthsNum) : totalMonthsLeft;
        } else {
          actualMonthsToGoal = Math.ceil(remainingAmount / monthlySaved);
        }
      } else {
        actualMonthsToGoal = Math.ceil(remainingAmount / monthlySaved);
      }
    }

    // Expected completion date
    const expectedCompDate = new Date();
    expectedCompDate.setMonth(expectedCompDate.getMonth() + actualMonthsToGoal);
    const expectedCompString = expectedCompDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    // Compound interest generated
    const compoundInterestEarned = Math.max(0, Math.round(inflatedTarget - currentAmount - (monthlySaved * actualMonthsToGoal)));

    return {
      inflatedTarget,
      remainingAmount,
      requiredMonthly: Math.max(0, requiredMonthly),
      actualMonthsToGoal: Math.max(1, actualMonthsToGoal),
      projectedDate: expectedCompString,
      compoundInterestEarned,
      recommendedMonthly: Math.max(0, recommendedMonthly)
    };
  };

  // Compute stats across all filtered goals
  const filteredGoals = goals.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All" || g.category === selectedCategoryFilter;
    const matchesPriority = selectedPriorityFilter === "All" || g.priority === selectedPriorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const totalTargetSum = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedSum = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallCompletionPct = totalTargetSum > 0 ? Math.round((totalSavedSum / totalTargetSum) * 100) : 0;
  
  // Total current monthly contribution rate
  const totalMonthlySavingsRate = goals.reduce((sum, g) => sum + (g.monthlyContribution || 250), 0);

  // Chronologically sorted goals for Timeline
  const chronologicalGoals = [...filteredGoals].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  // Badges catalog
  const badgeCategories = [
    { name: "Goal Begun", desc: "Successfully registered your initial saving milestone", icon: Star, unlocked: true, color: "text-sky-400 border-sky-500/20 bg-sky-950/20" },
    { name: "Bronze Saver", desc: "Crossed 10% milestone on any goal", icon: Award, unlocked: goals.some(g => (g.currentAmount / g.targetAmount) >= 0.10), color: "text-amber-500 border-amber-500/20 bg-amber-950/20" },
    { name: "Silver Stacker", desc: "Crossed 50% milestone on any goal", icon: Award, unlocked: goals.some(g => (g.currentAmount / g.targetAmount) >= 0.50), color: "text-slate-300 border-slate-300/20 bg-slate-900/20" },
    { name: "Sovereign Shield", desc: "Emergency Fund fully populated and achieved", icon: Shield, unlocked: goals.some(g => g.category === "Emergency Fund" && g.status === "Achieved"), color: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" },
    { name: "Property Pioneer", desc: "Initiated or completed a Real Estate / House goal", icon: Home, unlocked: goals.some(g => g.category === "House"), color: "text-indigo-400 border-indigo-500/20 bg-indigo-950/20" },
    { name: "Milestone Crusher", desc: "Successfully checked off all defined micro-milestones", icon: CheckCircle, unlocked: goals.some(g => g.badges?.includes("Milestone Crusher")), color: "text-violet-400 border-violet-500/20 bg-violet-950/20" }
  ];

  // Specific AI Savings Suggestions
  const aiSavingsRecommendations = [
    {
      id: "rec1",
      title: "Consolidate Entertainment Subscriptions",
      impact: "Saves $45/mo",
      text: "We noticed dual Netflix and other media logs. Pruning to standard tiers unlocks $540/year, cutting 2 full months off your House goal downpayment timeline.",
      goalName: "New Home Downpayment"
    },
    {
      id: "rec2",
      title: "Optimize Tech Purchase Speed",
      impact: "Trim 3 Months",
      text: "Shifting 5% of your discretionary dining outflow ($120) into your retirement or high-priority car fund accelerates target completion date securely.",
      goalName: "Retirement Compound Portfolio"
    },
    {
      id: "rec3",
      title: "Compound Dividend Reinvestment (DRIP)",
      impact: "Yield Boost +1.8%",
      text: "Directing portfolio dividend payouts directly into high-yield mutual fund targets rather than idle cash balances shaves weeks off vacation targets.",
      goalName: "Summer World Cruise"
    }
  ];

  // Render Category Icon helper
  const renderCategoryIcon = (category: string, className = "w-5 h-5") => {
    const config = getCategoryConfig(category);
    const Icon = config.icon;
    return <Icon className={`${className} ${config.color}`} />;
  };

  return (
    <div id="premium-goals-planning-view" className="space-y-6 relative">
      
      {/* Component Alerts Portal */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl text-xs font-mono font-bold flex items-center gap-2 max-w-sm transition-all duration-300 animate-slide-in ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400"
                : t.type === "warning"
                ? "bg-amber-950/90 border-amber-500/30 text-amber-400"
                : "bg-slate-900/90 border-slate-850 text-sky-400"
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <span className="text-sky-400 text-xs font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI-Driven Goal & Savings Synthesis
          </span>
          <h2 className="text-2xl font-black text-white">Intelligent Goal Planner</h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Formulate premium savings paths with multi-variant what-if simulations, micro-milestones tracking, family co-saving groups, real-time inflation indexers, and autonomous AI recommendations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black border border-sky-500/20 shadow-lg shadow-sky-950/40 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Formulate Saving Goal
        </button>
      </div>

      {/* Core KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
            <Target className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Target Sum</span>
            <h3 className="text-xl font-mono font-bold text-white mt-0.5">
              ${totalTargetSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h3>
            <span className="text-[9px] text-slate-500 font-mono block">Required across {goals.length} goals</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Award className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Saved Capital</span>
            <h3 className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
              ${totalSavedSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h3>
            <span className="text-[9px] text-slate-500 font-mono block">
              {overallCompletionPct}% consolidated progress
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Monthly Savings Speed</span>
            <h3 className="text-xl font-mono font-bold text-indigo-300 mt-0.5">
              ${totalMonthlySavingsRate.toLocaleString()}/mo
            </h3>
            <span className="text-[9px] text-slate-500 font-mono block">Autonomous recurring velocity</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <CheckCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-mono uppercase block">Completed Targets</span>
            <h3 className="text-xl font-mono font-bold text-white mt-0.5">
              {goals.filter(g => g.status === "Achieved").length} achieved
            </h3>
            <span className="text-[9px] text-emerald-400 font-mono block">
              {goals.filter(g => g.status === "On Track").length} active track
            </span>
          </div>
        </div>

      </div>

      {/* Goal Module Navigation */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
        {[
          { id: "dashboard", label: "Goal Dashboard & Milestones", icon: Target },
          { id: "simulator", label: "What-If Simulator & Projections", icon: Sliders },
          { id: "analytics", label: "Inflation & Analytics Matrix", icon: Calculator },
          { id: "family", label: "Co-Saving & Family Circles", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white border border-slate-800 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Primary Sub-Module Router */}
      <div className="space-y-6">
        
        {/* TAB 1: GOAL DASHBOARD & MILESTONES */}
        {activeSubTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Middle Column: Filterable Goals List & Milestone Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Filter controls panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col md:flex-row gap-3 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:w-60">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search goal name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 font-mono"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                  
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
                    <SlidersHorizontal className="w-3 h-3" />
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-transparent text-white border-none text-[11px] focus:outline-none font-bold cursor-pointer"
                    >
                      <option value="All" className="bg-slate-950">All Types</option>
                      {GOAL_TYPES.map(t => (
                        <option key={t.value} value={t.value} className="bg-slate-950">{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
                    <Star className="w-3 h-3" />
                    <select
                      value={selectedPriorityFilter}
                      onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                      className="bg-transparent text-white border-none text-[11px] focus:outline-none font-bold cursor-pointer"
                    >
                      <option value="All" className="bg-slate-950">All Priorities</option>
                      <option value="High" className="bg-slate-950">High Priority</option>
                      <option value="Medium" className="bg-slate-950">Medium Priority</option>
                      <option value="Low" className="bg-slate-950">Low Priority</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Goals Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGoals.length === 0 ? (
                  <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <Target className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-white font-bold">No active saving targets matched</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      Formulate a premium savings goal to start. Or clear search parameters to view pre-seeded portfolios.
                    </p>
                  </div>
                ) : (
                  filteredGoals.map((g) => {
                    const pct = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
                    const isSelected = selectedGoalId === g.id;
                    const catConfig = getCategoryConfig(g.category);

                    // Calculations
                    const analytics = calculateGoalAnalytics(g);

                    // Circle Progress metrics
                    const radius = 32;
                    const stroke = 5;
                    const normalizedRadius = radius - stroke * 2;
                    const circumference = normalizedRadius * 2 * Math.PI;
                    const strokeDashoffset = circumference - (pct / 100) * circumference;

                    return (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGoalId(g.id)}
                        className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all relative overflow-hidden group cursor-pointer text-left ${
                          isSelected 
                            ? "border-sky-500 shadow-xl shadow-sky-950/20 ring-1 ring-sky-500/20" 
                            : "border-slate-800 hover:border-slate-700 hover:shadow-lg"
                        }`}
                      >
                        {/* Dynamic backdrop glow */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none transition-all group-hover:scale-125"></div>

                        {/* Top Header */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex gap-3 items-center">
                            <div className={`p-2 rounded-xl border ${catConfig.bg} ${catConfig.border}`}>
                              {renderCategoryIcon(g.category, "w-5 h-5")}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase font-bold">
                                  {g.category}
                                </span>
                                {g.priority && (
                                  <span className={`text-[8px] font-mono font-black px-1 rounded ${
                                    g.priority === "High" ? "bg-rose-950 text-rose-400 border border-rose-500/10" :
                                    g.priority === "Medium" ? "bg-amber-950 text-amber-400 border border-amber-500/10" :
                                    "bg-slate-950 text-slate-400 border border-slate-800"
                                  }`}>
                                    {g.priority}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-white font-bold text-sm mt-0.5 line-clamp-1 group-hover:text-sky-400 transition-colors">
                                {g.name}
                              </h4>
                            </div>
                          </div>

                          {/* Progress Ring Visual */}
                          <div className="relative flex items-center justify-center shrink-0">
                            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                              <circle
                                stroke="#1e293b"
                                fill="transparent"
                                strokeWidth={stroke}
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                              />
                              <circle
                                stroke="url(#skyGradient)"
                                fill="transparent"
                                strokeWidth={stroke}
                                strokeDasharray={circumference + ' ' + circumference}
                                style={{ strokeDashoffset }}
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                                strokeLinecap="round"
                              />
                              <defs>
                                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0ea5e9" />
                                  <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <span className="absolute text-[10px] font-mono font-bold text-slate-300">
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Middle Numbers */}
                        <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-slate-400">Total Saved:</span>
                            <span className="text-emerald-400 font-bold">${g.currentAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-slate-400">Future Target:</span>
                            <span className="text-white font-semibold">${analytics.inflatedTarget.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Bottom Actions and Estimated Date */}
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-800/60 pt-3">
                          <span className="text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Achieved: <span className="text-slate-200 font-bold">{analytics.projectedDate}</span>
                          </span>

                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(g)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Edit Goal"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteGoal(g.id)}
                              className="p-1 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Goal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Team Co-saver indicator */}
                        {g.isFamily && g.familyMembers && (
                          <div className="pt-2 border-t border-slate-800/40 flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-sky-400" />
                            <span className="text-[9px] text-slate-400 font-mono">Shared co-saving: {g.familyMembers.join(" & ")}</span>
                          </div>
                        )}

                        {/* Shared with Financial Advisor indicator & re-send email */}
                        {g.isShared && g.sharedWith && g.sharedWith.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <Share2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="text-[9px] text-emerald-300 font-mono truncate">Advisor: {g.sharedWith.join(", ")}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (g.sharedWith && g.sharedWith.length > 0) {
                                  sendGoalEmailToAdviser(g, g.sharedWith);
                                }
                              }}
                              className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 hover:text-white rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                              title="Re-send email advisory report"
                            >
                              <Mail className="w-2.5 h-2.5" /> Email Advisor
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Milestones and Calendar Details of Active Selected Goal */}
              {activeGoal && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs text-sky-400 font-mono font-bold">Micro-milestone Matrix</span>
                      <h3 className="text-white font-bold text-base mt-0.5">
                        '{activeGoal.name}' Segment Targets
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] font-mono rounded text-slate-400">
                      {activeGoal.milestones?.filter(m => m.achieved).length || 0} / {activeGoal.milestones?.length || 0} Achieved
                    </span>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-3">
                    {activeGoal.milestones?.map(m => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                          m.achieved 
                            ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-slate-950/50 border-slate-850 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleMilestone(activeGoal.id, m.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                              m.achieved 
                                ? "bg-emerald-500 border-emerald-400 text-white" 
                                : "border-slate-700 hover:border-slate-500 text-transparent"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <div>
                            <p className={`text-xs font-bold ${m.achieved ? "text-emerald-300 line-through" : "text-white"}`}>
                              {m.name}
                            </p>
                            <span className="text-[10px] font-mono text-slate-500">Target Segment Capital: ${m.amount.toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMilestone(activeGoal.id, m.id)}
                          className="p-1 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {(!activeGoal.milestones || activeGoal.milestones.length === 0) && (
                      <p className="text-xs text-slate-500 font-mono italic">No sub-milestones initialized yet.</p>
                    )}
                  </div>

                  {/* Add Custom Milestone Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddMilestone(activeGoal.id);
                    }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-850"
                  >
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Milestone title, e.g. Book reservations"
                        value={newMilestoneName}
                        onChange={(e) => setNewMilestoneName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amt ($)"
                        value={newMilestoneAmount}
                        onChange={(e) => setNewMilestoneAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </form>

                </div>
              )}

            </div>

            {/* Right Column: AI Suggestions, Achievements & Reminders */}
            <div className="space-y-6">
              
              {/* Achievement Badges Showcase */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-left">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <Award className="w-4.5 h-4.5 text-amber-400 animate-bounce" />
                  <h3 className="text-white font-bold text-xs">Achievement Badges Showcase</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {badgeCategories.map((badge, idx) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1.5 transition-all ${
                          badge.unlocked
                            ? badge.color
                            : "bg-slate-950 border-slate-850/40 text-slate-600 opacity-40"
                        }`}
                        title={badge.desc}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px] font-black leading-tight truncate w-full">{badge.name}</span>
                        <span className="text-[8px] font-medium leading-none text-slate-500">{badge.unlocked ? "Unlocked" : "Locked"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Goal Dynamic Target Alerts & Rules Engine */}
              {activeGoal && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-400" />
                      <div>
                        <h3 className="text-white font-bold text-xs">Dynamic Target Alerts</h3>
                        <span className="text-[10px] text-slate-400 block font-mono">Live goal rules & threshold monitoring</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scanAndEvaluateAllGoals(activeGoal.id)}
                        disabled={isScanningTargets}
                        className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                        title="Evaluate progress and trigger target alert rules"
                      >
                        <RefreshCw className={`w-3 h-3 ${isScanningTargets ? "animate-spin text-sky-300" : ""}`} />
                        <span>{isScanningTargets ? "Evaluating..." : "Scan Target"}</span>
                      </button>
                      <span className="px-1.5 py-0.5 bg-slate-950 text-[9px] text-slate-500 font-mono rounded border border-slate-800">
                        {activeGoal.reminders?.length || 0} rules
                      </span>
                    </div>
                  </div>

                  {/* Preset Quick Rule Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Quick Target Rule Presets</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddDynamicRule(activeGoal.id, undefined, "milestone", 50)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-sky-400 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-sky-400" />
                        <span>50% Milestone Alert</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddDynamicRule(activeGoal.id, undefined, "milestone", 90)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-sky-400 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-amber-400" />
                        <span>90% Near-Completion Alert</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddDynamicRule(activeGoal.id, undefined, "deadline", 30)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-sky-400 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-purple-400" />
                        <span>30-Day Deadline Alert</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddDynamicRule(activeGoal.id, undefined, "velocity")}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-sky-400 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Savings Velocity Deficit</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Target Rules List */}
                  <div className="divide-y divide-slate-800/60 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {activeGoal.reminders?.map((rem) => {
                      const isTriggered = rem.status === "triggered";
                      return (
                        <div key={rem.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                          <div className="space-y-1 overflow-hidden">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs text-white font-mono leading-snug truncate">{rem.text}</p>
                              <span className={`px-1.5 py-0.2 text-[8px] font-mono rounded font-bold uppercase tracking-wider ${
                                isTriggered ? "bg-amber-950/80 text-amber-400 border border-amber-500/20" : "bg-sky-950/80 text-sky-400 border border-sky-500/20"
                              }`}>
                                {isTriggered ? "⚡ Triggered" : "🟢 Active Monitoring"}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono block">
                              Created: {rem.date} {rem.lastTriggeredAt ? `• Last Fired: ${rem.lastTriggeredAt}` : ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleFireTestAlert(activeGoal, rem)}
                              title="Test trigger alert and dispatch notification"
                              className="px-2 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-500/30 text-sky-400 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Play className="w-2.5 h-2.5" />
                              <span>Test Fire</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReminder(activeGoal.id, rem.id)}
                              title="Delete rule"
                              className="p-1 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {(!activeGoal.reminders || activeGoal.reminders.length === 0) && (
                      <div className="p-3 text-center bg-slate-950/40 rounded-xl border border-slate-850/60">
                        <p className="text-xs text-slate-400 italic">No target alert rules configured yet.</p>
                        <p className="text-[10px] text-slate-500 mt-1">Select a quick preset above or build a custom threshold rule below.</p>
                      </div>
                    )}
                  </div>

                  {/* Add Custom Dynamic Rule form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newReminderText.trim()) {
                        handleAddDynamicRule(activeGoal.id, newReminderText.trim(), newAlertType);
                      } else {
                        handleAddDynamicRule(activeGoal.id);
                      }
                    }}
                    className="pt-2 border-t border-slate-800/60 space-y-2"
                  >
                    <div className="flex gap-2">
                      <select
                        value={newAlertType}
                        onChange={(e) => setNewAlertType(e.target.value as any)}
                        className="bg-slate-950 border border-slate-850 text-slate-300 rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none"
                      >
                        <option value="milestone">🎯 Milestone %</option>
                        <option value="custom">💰 Target Value $</option>
                        <option value="deadline">⏱️ Deadline Days</option>
                        <option value="velocity">⚡ Savings Velocity</option>
                      </select>

                      {newAlertType === "milestone" && (
                        <input
                          type="number"
                          placeholder="e.g. 80"
                          value={newAlertThreshold}
                          onChange={(e) => setNewAlertThreshold(e.target.value)}
                          className="w-20 bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none font-mono"
                        />
                      )}

                      {newAlertType === "custom" && (
                        <input
                          type="number"
                          placeholder="Target $"
                          value={newAlertThreshold}
                          onChange={(e) => setNewAlertThreshold(e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none font-mono"
                        />
                      )}

                      <input
                        type="text"
                        placeholder="Custom rule description..."
                        value={newReminderText}
                        onChange={(e) => setNewReminderText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                      />

                      <button
                        type="submit"
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono transition-colors cursor-pointer font-bold shrink-0 shadow"
                      >
                        + Add Rule
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* AI savings optimization recommendations */}
              <div className="bg-sky-950/10 border-2 border-sky-500/25 rounded-2xl p-5 space-y-3.5 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] text-sky-400 font-mono uppercase font-black tracking-widest">AI Actionable Recommendations</span>
                </div>

                <div className="space-y-3 pt-1">
                  {aiSavingsRecommendations.map((rec) => {
                    const isRelated = activeGoal && activeGoal.name.toLowerCase().includes(rec.goalName.toLowerCase().split(" ")[0]);
                    return (
                      <div
                        key={rec.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isRelated 
                            ? "bg-sky-950/40 border-sky-500/40" 
                            : "bg-slate-950/40 border-slate-850"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-white">{rec.title}</span>
                          <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 text-[8px] font-mono rounded font-black border border-emerald-500/10">
                            {rec.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{rec.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: WHAT-IF SIMULATOR & PROJECTIONS */}
        {activeSubTab === "simulator" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-left">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-sky-400" />
                  Goal Savings Trajectory Simulator
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Live modeling sandbox: see how rate hikes or extra contributions shave months off target dates.</p>
              </div>

              {/* Goal selector */}
              {goals.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 shrink-0">
                  <span className="font-mono">Simulating:</span>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="bg-transparent text-white border-none text-[11px] font-bold focus:outline-none cursor-pointer"
                  >
                    {goals.map(g => (
                      <option key={g.id} value={g.id} className="bg-slate-950">{g.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activeGoal ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sliders Input Section */}
                <div className="space-y-6 bg-slate-950 p-5 rounded-2xl border border-slate-850">
                  <h4 className="text-white font-bold text-xs font-mono uppercase tracking-wider">Simulated Parameter Sandbox</h4>
                  
                  {/* Monthly Contribution Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Monthly Contribution Lift</span>
                      <span className="text-sky-400 font-mono font-bold">+${simExtraSavings}/mo</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1500"
                      step="25"
                      value={simExtraSavings}
                      onChange={(e) => setSimExtraSavings(parseFloat(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Standard Rate (${activeGoal.monthlyContribution || 250}/mo)</span>
                      <span>+$1,500/mo Max</span>
                    </div>
                  </div>

                  {/* Yield Lift Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Yield Strategy Outperformance</span>
                      <span className="text-sky-400 font-mono font-bold">+{simExtraYield}% yield</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={simExtraYield}
                      onChange={(e) => setSimExtraYield(parseFloat(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Baseline Rate ({activeGoal.expectedRateOfReturn || 6}%)</span>
                      <span>+10% Max Outperformance</span>
                    </div>
                  </div>

                  {/* Inflation Toggles */}
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs text-slate-200 font-bold block">Inflation Compensator</span>
                      <span className="text-[10px] text-slate-500 font-mono">Adjusts target up ({activeGoal.inflationRate || 3}% per year)</span>
                    </div>
                    <button
                      onClick={() => setSimInflationToggle(!simInflationToggle)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        simInflationToggle ? "bg-sky-600" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          simInflationToggle ? "translate-x-5.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Strategy Presets</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSimExtraSavings(0);
                          setSimExtraYield(0);
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 font-mono hover:text-white cursor-pointer"
                      >
                        Reset Sandbox
                      </button>
                      <button
                        onClick={() => {
                          setSimExtraSavings(250);
                          setSimExtraYield(2);
                        }}
                        className="px-2.5 py-1.5 bg-sky-950/20 border border-sky-500/25 rounded-lg text-[10px] text-sky-400 font-mono hover:text-white cursor-pointer"
                      >
                        Passive Boost
                      </button>
                    </div>
                  </div>

                </div>

                {/* Dynamic Projections Output Display */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Calculated Sandbox Trajectories compared to Baseline */}
                  {(() => {
                    const baseline = calculateGoalAnalytics(activeGoal);
                    const sandboxed = calculateGoalAnalytics(activeGoal, simExtraSavings, simExtraYield);
                    const monthsSaved = Math.max(0, baseline.actualMonthsToGoal - sandboxed.actualMonthsToGoal);

                    // Dynamic SVG chart path generation for CAGR growth
                    const width = 500;
                    const height = 140;
                    const padding = 15;
                    const chartWidth = width - padding * 2;
                    const chartHeight = height - padding * 2;

                    const totalPoints = sandboxed.actualMonthsToGoal;
                    let currentAmt = activeGoal.currentAmount;
                    const rate = ((activeGoal.expectedRateOfReturn || 6) + simExtraYield) / 100 / 12;
                    const saveRate = (activeGoal.monthlyContribution || 250) + simExtraSavings;
                    
                    const points: { x: number; y: number }[] = [];
                    points.push({ x: padding, y: padding + chartHeight });

                    for (let m = 1; m <= Math.min(totalPoints, 60); m++) {
                      currentAmt = (currentAmt + saveRate) * (1 + rate);
                      const fraction = m / Math.min(totalPoints, 60);
                      const x = padding + fraction * chartWidth;
                      const yPct = Math.min(1, currentAmt / sandboxed.inflatedTarget);
                      const y = padding + chartHeight - (yPct * chartHeight);
                      points.push({ x, y });
                    }

                    const pathString = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

                    return (
                      <div className="space-y-6">
                        
                        {/* Highlights Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          
                          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                            <span className="text-[10px] text-slate-500 font-mono block">Baseline Deadline</span>
                            <span className="text-sm font-bold text-slate-300 font-mono block mt-1">{baseline.projectedDate}</span>
                            <span className="text-[9px] text-slate-600 font-mono">{baseline.actualMonthsToGoal} months total</span>
                          </div>

                          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl ring-1 ring-sky-500/20">
                            <span className="text-[10px] text-sky-400 font-mono block">Simulated Deadline</span>
                            <span className="text-sm font-bold text-white font-mono block mt-1">{sandboxed.projectedDate}</span>
                            <span className="text-[9px] text-emerald-400 font-mono">{sandboxed.actualMonthsToGoal} months total</span>
                          </div>

                          <div className="bg-sky-950/20 border border-sky-500/30 p-4 rounded-xl col-span-2 sm:col-span-1 flex flex-col justify-between">
                            <span className="text-[10px] text-emerald-400 font-mono block">Time Saved</span>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-xl font-mono font-black text-white">{monthsSaved}</span>
                              <span className="text-xs text-slate-300">Months</span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">Accelerated target</span>
                          </div>

                        </div>

                        {/* Chart Box */}
                        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-sky-400" />
                              Compounding Savings Trajectory (Next {Math.min(totalPoints, 60)} Months)
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Compounding rate: {((activeGoal.expectedRateOfReturn || 6) + simExtraYield).toFixed(1)}%</span>
                          </div>

                          {/* SVG Plot */}
                          <div className="w-full h-40 pt-2">
                            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                              {/* Background grid horizontal lines */}
                              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3" />
                              <line x1={padding} y1={padding + chartHeight/2} x2={width - padding} y2={padding + chartHeight/2} stroke="#1e293b" strokeDasharray="3" />
                              <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#334155" />

                              {/* Target baseline mark */}
                              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2" />
                              <text x={width - padding - 80} y={padding + 11} fill="#f59e0b" className="text-[8px] font-mono">Target: ${sandboxed.inflatedTarget.toLocaleString()}</text>

                              {/* Gradient Area under line */}
                              {points.length > 1 && (
                                <path
                                  d={`M ${padding},${padding + chartHeight} L ${pathString} L ${width - padding},${padding + chartHeight} Z`}
                                  fill="url(#sandboxAreaGradient)"
                                  opacity="0.15"
                                />
                              )}

                              {/* Actual Line plot */}
                              {points.length > 1 && (
                                <path
                                  d={`M ${pathString}`}
                                  fill="none"
                                  stroke="#0ea5e9"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                              )}

                              {/* Target Point Dot */}
                              {points.length > 1 && (
                                <circle
                                  cx={points[points.length - 1].x}
                                  cy={points[points.length - 1].y}
                                  r="4.5"
                                  fill="#10b981"
                                  stroke="#0ea5e9"
                                  strokeWidth="1.5"
                                />
                              )}

                              <defs>
                                <linearGradient id="sandboxAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#0ea5e9" />
                                  <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>

                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Month 0 (Balance: ${activeGoal.currentAmount.toLocaleString()})</span>
                            <span>Target Achieved (Month {sandboxed.actualMonthsToGoal})</span>
                          </div>
                        </div>

                        {/* Compound interest statistics box */}
                        <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Info className="w-4.5 h-4.5 text-sky-400 shrink-0" />
                            <p className="text-slate-400">
                              With compounding, you'll earn <span className="text-emerald-400 font-bold">${sandboxed.compoundInterestEarned.toLocaleString()}</span> in simulated investment growth to help clear your target.
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-500">Please formulate an active target saving goal first.</p>
            )}

          </div>
        )}

        {/* TAB 3: INFLATION & ANALYTICS */}
        {activeSubTab === "analytics" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-sky-400" />
                  Inflation Adjuster & Goal Analysis Matrix
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Determine how inflation eats into your future savings and find the exact monthly recommend rate to stay safe.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="pb-3 font-medium">Goal Name</th>
                    <th className="pb-3 font-medium text-right">Standard Target</th>
                    <th className="pb-3 font-medium text-right">Years Remaining</th>
                    <th className="pb-3 font-medium text-right">Assumed Inflation</th>
                    <th className="pb-3 font-medium text-right">Inflation-Adjusted Target</th>
                    <th className="pb-3 font-medium text-right">Current Saved</th>
                    <th className="pb-3 font-medium text-right">Monthly Rec Rate</th>
                    <th className="pb-3 font-medium text-right">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {goals.map((g) => {
                    const targetDate = new Date(g.targetDate);
                    const currentDate = new Date();
                    const totalMonthsLeft = Math.max(1, 
                      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                      (targetDate.getMonth() - currentDate.getMonth())
                    );
                    const yearsLeft = (totalMonthsLeft / 12).toFixed(1);
                    
                    const analytics = calculateGoalAnalytics(g);

                    return (
                      <tr key={g.id} className="hover:bg-slate-950/30">
                        <td className="py-3.5 font-bold text-white flex items-center gap-2">
                          {renderCategoryIcon(g.category, "w-4.5 h-4.5")}
                          <span>{g.name}</span>
                        </td>
                        <td className="py-3.5 text-right font-mono text-slate-400">${g.targetAmount.toLocaleString()}</td>
                        <td className="py-3.5 text-right font-mono text-slate-300">{yearsLeft} Years</td>
                        <td className="py-3.5 text-right font-mono text-rose-400">{(g.inflationRate || 3)}% / year</td>
                        <td className="py-3.5 text-right font-mono font-bold text-white">${analytics.inflatedTarget.toLocaleString()}</td>
                        <td className="py-3.5 text-right font-mono text-emerald-400">${g.currentAmount.toLocaleString()}</td>
                        <td className="py-3.5 text-right font-mono text-sky-400 font-black">${analytics.recommendedMonthly}/mo</td>
                        <td className="py-3.5 text-right text-[11px] text-slate-400 max-w-xs truncate" title={aiSavingsRecommendations.find(r => r.goalName === g.name)?.text}>
                          {aiSavingsRecommendations.find(r => r.goalName === g.name)?.text || "Increase deposit speed slightly to guarantee on-track timeline parameters."}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Static informational box about Inflation */}
            <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">Why Adjusting for Inflation Matters</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A target cost of $50,000 for a house downpayment in 10 years will feel different. Assuming a standard 3% annual inflation, that same purchasing power will actually require <span className="text-white font-bold">$67,195</span>. This table solves the discrepancy automatically, calculating savings rates based on the true future value.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: CO-SAVING & FAMILY CIRCLES */}
        {activeSubTab === "family" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-400" />
                  Co-Saving & Shared Family Goals
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Combine savings with spouses, co-signers, or children to clear targets together.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Shared Goals listing */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-white font-bold text-sm">Your Shared Financial Circles</h4>

                <div className="space-y-4">
                  {goals.filter(g => g.isFamily || g.isShared).map((g) => {
                    const members = g.familyMembers || g.sharedWith || [];
                    const pct = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);

                    return (
                      <div key={g.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-500/10 rounded-lg">
                              {renderCategoryIcon(g.category, "w-4.5 h-4.5")}
                            </div>
                            <div>
                              <h5 className="text-white font-bold text-sm">{g.name}</h5>
                              <span className="text-[10px] text-slate-500 font-mono block">Target: ${g.targetAmount.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <span className="text-xs px-2.5 py-0.5 bg-sky-950 text-sky-400 border border-sky-500/20 rounded-full font-mono font-bold">
                            {g.isFamily ? "Family Group" : "Shared Circle"}
                          </span>
                        </div>

                        {/* Co-saver member circles */}
                        <div className="flex flex-wrap items-center gap-4 py-1.5 border-t border-b border-slate-800/40">
                          <span className="text-[10px] text-slate-500 font-mono uppercase">Contributors:</span>
                          <div className="flex items-center -space-x-1.5">
                            <div className="w-6.5 h-6.5 rounded-full bg-sky-600 flex items-center justify-center text-[10px] font-black text-white border border-slate-950" title="Alex Rivera (You)">AR</div>
                            {members.map((m, i) => (
                              <div key={i} className="w-6.5 h-6.5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white border border-slate-950 uppercase" title={m}>
                                {m.substring(0, 2)}
                              </div>
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-400">Alex + {members.join(", ")}</span>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-400">Progress Saved:</span>
                            <span className="text-slate-200 font-bold">${g.currentAmount.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/40">
                            <div
                              className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {goals.filter(g => g.isFamily || g.isShared).length === 0 && (
                    <p className="text-xs text-slate-500 italic">No goals configured as Family or Shared currently.</p>
                  )}
                </div>

              </div>

              {/* Right Column: Invite contributor box */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <div className="flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-sky-400" />
                    <h4 className="text-white font-bold text-xs font-mono uppercase tracking-wider">Invite Circle Contributor</h4>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Securely invite a partner, financial adviser, or relative to view or contribute to active savings targets.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-mono block mb-1">Contributor Email</label>
                      <input
                        type="email"
                        placeholder="e.g. advisor@finsight.io, partner@family.com"
                        value={contributorEmail}
                        onChange={(e) => setContributorEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-mono block mb-1">Access Level</label>
                      <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                        <option value="view">Can View and Track</option>
                        <option value="contribute">Can Log Co-savings Deposits</option>
                        <option value="co-owner">Full Co-owner Rights</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => sendContributorInvite(contributorEmail)}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" /> Send Invitation Email
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Add / Edit Goal Dialog Backdrop */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-black text-lg mb-1">
              {editingId ? "Modify Target Goal" : "Formulate Premium Goal"}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Input parameters for compound growth calculations and inflation offsets.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Goal Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Retirement Security Fund, Wedding Downpayment"
                  value={formData.name}
                  onChange={(ev) => setFormData({ ...formData, name: ev.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Goal Type / Category</label>
                  <select
                    value={formData.category}
                    onChange={(ev) => setFormData({ ...formData, category: ev.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50 cursor-pointer"
                  >
                    {GOAL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Priority Rank</label>
                  <select
                    value={formData.priority}
                    onChange={(ev) => setFormData({ ...formData, priority: ev.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50 cursor-pointer"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Target Sum ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.targetAmount}
                    onChange={(ev) => setFormData({ ...formData, targetAmount: ev.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Current Seed Balance ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={(ev) => setFormData({ ...formData, currentAmount: ev.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(ev) => setFormData({ ...formData, targetDate: ev.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Monthly Contribution ($)</label>
                  <input
                    type="number"
                    placeholder="300"
                    value={formData.monthlyContribution}
                    onChange={(ev) => setFormData({ ...formData, monthlyContribution: ev.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Assumed Growth Yield (% yr)</label>
                  <input
                    type="number"
                    placeholder="7"
                    value={formData.expectedRateOfReturn}
                    onChange={(ev) => setFormData({ ...formData, expectedRateOfReturn: ev.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Assumed Inflation Rate (% yr)</label>
                  <input
                    type="number"
                    placeholder="3"
                    value={formData.inflationRate}
                    onChange={(ev) => setFormData({ ...formData, inflationRate: ev.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 font-mono"
                  />
                </div>
              </div>

              {/* Co-saving parameters */}
              <div className="space-y-3.5 bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-slate-200 font-bold">Family / Group Co-saving Option</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isFamily}
                    onChange={(e) => setFormData({ ...formData, isFamily: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>

                {formData.isFamily && (
                  <div>
                    <label className="text-[10px] text-slate-500 font-mono block mb-1">Co-savers (Comma-separated names)</label>
                    <input
                      type="text"
                      placeholder="e.g. Sophia, Mom, Partner"
                      value={formData.familyMembersString}
                      onChange={(e) => setFormData({ ...formData, familyMembersString: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3.5 bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-slate-200 font-bold">Share with Financial Adviser</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isShared}
                    onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>

                {formData.isShared && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-mono block">Adviser or Monitor Emails (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. advisor@finsight.io, partner@finsight.io"
                      value={formData.sharedWithString}
                      onChange={(e) => setFormData({ ...formData, sharedWithString: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50"
                    />
                    <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Mail className="w-3 h-3 shrink-0" />
                      An advisory wealth statement email will be sent automatically upon saving.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingId ? "Save Changes" : "Synthesize Saving Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
