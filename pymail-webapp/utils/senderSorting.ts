import { SenderStats } from "@/types/api";

export type SortField =
  | "email_count"
  | "spam_score"
  | "open_rate"
  | "sender_name"
  | "sender_email"
  | "sender_alphanum";

export type SortDirection = "asc" | "desc";

export type GroupBy = "none" | "domain" | "open_rate_range";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface GroupConfig {
  groupBy: GroupBy;
  sortWithinGroups: SortConfig;
}

// Extract domain from email
function extractDomain(email: string): string {
  const match = email.match(/@(.+)$/);
  return match ? match[1].toLowerCase() : "unknown";
}

// Get open rate range category
function getOpenRateRange(openRate: number): string {
  if (openRate === 0) return "Never opened (0%)";
  if (openRate < 10) return "Rarely opened (1-9%)";
  if (openRate < 25) return "Seldom opened (10-24%)";
  if (openRate < 50) return "Sometimes opened (25-49%)";
  if (openRate < 75) return "Often opened (50-74%)";
  return "Frequently opened (75-100%)";
}

// Compare function for sorting
export function compareSenders(
  a: SenderStats,
  b: SenderStats,
  config: SortConfig,
): number {
  const { field, direction } = config;
  let comparison = 0;

  switch (field) {
    case "email_count":
      comparison = a.email_count - b.email_count;
      break;

    case "spam_score":
      comparison = a.spam_score - b.spam_score;
      break;

    case "open_rate":
      comparison = a.open_rate - b.open_rate;
      break;

    case "sender_name":
      comparison = a.sender_name.localeCompare(b.sender_name);
      break;

    case "sender_email":
      comparison = a.sender_email.localeCompare(b.sender_email);
      break;

    case "sender_alphanum": {
      // Natural alphanumeric sorting (handles numbers in strings)
      const nameA = a.sender_name.toLowerCase();
      const nameB = b.sender_name.toLowerCase();
      comparison = nameA.localeCompare(nameB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      break;
    }

    default:
      comparison = 0;
  }

  // Apply direction
  return direction === "asc" ? comparison : -comparison;
}

// Sort senders array
export function sortSenders(
  senders: SenderStats[],
  config: SortConfig,
): SenderStats[] {
  return [...senders].sort((a, b) => compareSenders(a, b, config));
}

// Group senders
export function groupSenders(
  senders: SenderStats[],
  config: GroupConfig,
): Map<string, SenderStats[]> {
  const { groupBy, sortWithinGroups } = config;

  if (groupBy === "none") {
    return new Map([["All Senders", sortSenders(senders, sortWithinGroups)]]);
  }

  const groups = new Map<string, SenderStats[]>();

  senders.forEach((sender) => {
    let groupKey: string;

    switch (groupBy) {
      case "domain": {
        const domain = extractDomain(sender.sender_email);
        groupKey = `📧 ${domain}`;
        break;
      }

      case "open_rate_range": {
        groupKey = getOpenRateRange(sender.open_rate);
        break;
      }

      default:
        groupKey = "All Senders";
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(sender);
  });

  // Sort within each group
  groups.forEach((groupSenders, key) => {
    groups.set(key, sortSenders(groupSenders, sortWithinGroups));
  });

  // Sort groups by a logical order
  return new Map(
    [...groups.entries()].sort(([keyA, sendersA], [keyB, sendersB]) => {
      if (groupBy === "open_rate_range") {
        // Order: Never → Rarely → ... → Frequently
        const order = [
          "Never opened (0%)",
          "Rarely opened (1-9%)",
          "Seldom opened (10-24%)",
          "Sometimes opened (25-49%)",
          "Often opened (50-74%)",
          "Frequently opened (75-100%)",
        ];
        return order.indexOf(keyA) - order.indexOf(keyB);
      } else if (groupBy === "domain") {
        // Sort domains by total email count descending
        const totalA = sendersA.reduce((sum, s) => sum + s.email_count, 0);
        const totalB = sendersB.reduce((sum, s) => sum + s.email_count, 0);
        return totalB - totalA;
      }
      return keyA.localeCompare(keyB);
    }),
  );
}

// Get sort field display name
export function getSortFieldLabel(field: SortField): string {
  switch (field) {
    case "email_count":
      return "Email Count";
    case "spam_score":
      return "Spam Score";
    case "open_rate":
      return "Open Rate";
    case "sender_name":
      return "Sender Name (A-Z)";
    case "sender_email":
      return "Email Address";
    case "sender_alphanum":
      return "Name (Natural Sort)";
    default:
      return field;
  }
}

// Get group by display name
export function getGroupByLabel(groupBy: GroupBy): string {
  switch (groupBy) {
    case "none":
      return "No Grouping";
    case "domain":
      return "By Domain";
    case "open_rate_range":
      return "By Engagement";
    default:
      return groupBy;
  }
}

// Compute group statistics
export interface GroupStats {
  totalEmails: number;
  averageSpamScore: number;
  averageOpenRate: number;
  senderCount: number;
}

export function computeGroupStats(senders: SenderStats[]): GroupStats {
  if (senders.length === 0) {
    return {
      totalEmails: 0,
      averageSpamScore: 0,
      averageOpenRate: 0,
      senderCount: 0,
    };
  }

  const totalEmails = senders.reduce((sum, s) => sum + s.email_count, 0);
  const totalSpamScore = senders.reduce((sum, s) => sum + s.spam_score, 0);
  const totalOpenRate = senders.reduce((sum, s) => sum + s.open_rate, 0);

  return {
    totalEmails,
    averageSpamScore: Math.round(totalSpamScore / senders.length),
    averageOpenRate: Math.round(totalOpenRate / senders.length),
    senderCount: senders.length,
  };
}
