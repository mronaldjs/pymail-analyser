interface SpamRiskBadgeProps {
  risk?: string;
}

const RISK: Record<string, { color: string; label: string; desc: string }> = {
  high: {
    color: "#f7768e",
    label: "High",
    desc: "High risk — many sends with low open rate or suspicious domain.",
  },
  medium: {
    color: "#e5c07b",
    label: "Medium",
    desc: "Medium risk — mixed signals, monitor the sender.",
  },
  low: {
    color: "#98c379",
    label: "Low",
    desc: "Low risk — sender likely legitimate or with good engagement.",
  },
};

export function SpamRiskBadge({ risk }: SpamRiskBadgeProps) {
  if (!risk) return null;
  const meta = RISK[risk] ?? {
    color: "#a8b0bd",
    label: risk,
    desc: "Unknown risk.",
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide"
      style={{ color: meta.color }}
      title={meta.desc}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}
