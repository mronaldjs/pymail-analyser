interface SpamRiskBadgeProps {
  risk?: string;
}

export function SpamRiskBadge({ risk }: SpamRiskBadgeProps) {
  if (!risk) return null;

  const getRiskStyles = () => {
    switch (risk) {
      case "high":
        return "bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
      case "low":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/30";
    }
  };

  const getRiskLabel = () => {
    switch (risk) {
      case "high":
        return "High Risk";
      case "medium":
        return "Medium Risk";
      case "low":
        return "Low Risk";
      default:
        return risk;
    }
  };

  const getRiskDescription = () => {
    switch (risk) {
      case "high":
        return "High risk — many sends with low open rate or suspicious domain.";
      case "medium":
        return "Medium risk — mixed signals, monitor the sender.";
      case "low":
        return "Low risk — sender likely legitimate or with good engagement.";
      default:
        return "Unknown risk.";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRiskStyles()}`}
      title={getRiskDescription()}
    >
      {getRiskLabel()}
    </span>
  );
}
