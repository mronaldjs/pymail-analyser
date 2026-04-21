interface SpamRiskBadgeProps {
  risk?: string;
}

export function SpamRiskBadge({ risk }: SpamRiskBadgeProps) {
  if (!risk) return null;

  const getRiskStyles = () => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRiskLabel = () => {
    switch (risk) {
      case "high":
        return "Alto Risco";
      case "medium":
        return "Médio Risco";
      case "low":
        return "Baixo Risco";
      default:
        return risk;
    }
  };

  const getRiskDescription = () => {
    switch (risk) {
      case "high":
        return "Alto risco — muitos envios com baixa taxa de abertura ou domínio suspeito.";
      case "medium":
        return "Risco médio — sinais mistos, acompanhe o remetente.";
      case "low":
        return "Baixo risco — remetente provavelmente legítimo ou com boa interação.";
      default:
        return "Risco desconhecido.";
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
