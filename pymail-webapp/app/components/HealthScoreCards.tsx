import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMAPCredentials } from "@/types/api";
import { Shield, Mail, Activity } from "lucide-react";

interface HealthScoreCardsProps {
  healthScore: number;
  totalEmailsScanned: number;
  credentials: IMAPCredentials;
}

export function HealthScoreCards({
  healthScore,
  totalEmailsScanned,
  credentials,
}: HealthScoreCardsProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] cursor-default">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Health Score
          </CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            {/* Background track */}
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              <circle
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
              />
              {/* Progress ring */}
              <circle
                className={`transition-all duration-1000 ease-out ${getScoreColor(healthScore)} drop-shadow-[0_0_8px_rgba(currentColor,0.5)]`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span
                className={`text-2xl font-bold ${getScoreColor(healthScore)}`}
              >
                {healthScore}
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Score
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground leading-snug font-medium">
              Calculated from spam volume, open rates, and sender reputation.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 overflow-hidden relative transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-accent/20 hover:scale-[1.02] cursor-default">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Emails Analyzed
          </CardTitle>
          <Mail className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent className="flex flex-col justify-center h-[120px]">
          <div className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground">
            {totalEmailsScanned.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            {credentials.start_date && credentials.end_date
              ? `From ${new Date(credentials.start_date).toLocaleDateString("en-US")} to ${new Date(credentials.end_date).toLocaleDateString("en-US")}`
              : `Last ${credentials.days_limit} days`}
          </p>
        </CardContent>
      </Card>

      {/* Empty skeleton card for visual balance in the 3-col grid on large screens */}
      <Card className="glass-card hidden lg:flex flex-col justify-center items-center opacity-50 border-dashed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <Shield className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <span className="text-sm font-medium text-muted-foreground/50">
          Inbox Secure
        </span>
      </Card>
    </div>
  );
}
