export interface NotificationItem {
  id: string;
  type:
    | "budget"
    | "goal"
    | "bill"
    | "investment"
    | "recommendation"
    | "security"
    | "subscription"
    | "tax"
    | "savings"
    | "summary";
  title: string;
  desc: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  priority: "low" | "medium" | "high";
  category: "Financial Status" | "Security & System" | "Reminders & Autopay" | "AI Strategic Insights";
  actionText?: string;
  actionType?: "settle" | "rebalance" | "secure" | "view" | "claim";
}

export const dispatchDynamicNotification = (
  item: Omit<NotificationItem, "id" | "timestamp" | "read" | "archived"> & { id?: string }
): NotificationItem | null => {
  try {
    const raw = localStorage.getItem("finsight_intelligent_notifs");
    let current: NotificationItem[] = [];
    if (raw) {
      try {
        current = JSON.parse(raw);
      } catch (e) {
        current = [];
      }
    }

    const newItem: NotificationItem = {
      id: item.id || `notif-dynamic-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: item.type,
      title: item.title,
      desc: item.desc,
      timestamp: "Just now",
      read: false,
      archived: false,
      priority: item.priority || "medium",
      category: item.category || "Financial Status",
      actionText: item.actionText,
      actionType: item.actionType
    };

    // Filter out duplicate if exact ID exists
    const filtered = current.filter((n) => n.id !== newItem.id);
    const updated = [newItem, ...filtered];
    localStorage.setItem("finsight_intelligent_notifs", JSON.stringify(updated));

    // Dispatch window event so components like NotificationsTab dynamically update in real-time
    window.dispatchEvent(new CustomEvent("finsight_notification_added", { detail: newItem }));

    // Automatically send to Email and Offline SMS in the background
    try {
      const userMail = localStorage.getItem("finsight_user_email") || "gayakwadshubh@gmail.com";
      const userPhone = localStorage.getItem("finsight_user_phone") || "+12186569048";
      fetch("/api/notifications/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newItem.title,
          desc: newItem.desc,
          category: newItem.category,
          priority: newItem.priority,
          type: newItem.type,
          email: userMail,
          phone: userPhone,
          sendEmail: true,
          sendSms: true
        })
      }).catch((err) => console.warn("Background mail/sms notification dispatch warning:", err));
    } catch (e) {
      // Ignore background fetch error
    }

    return newItem;
  } catch (err) {
    console.error("Failed to dispatch dynamic notification:", err);
    return null;
  }
};
