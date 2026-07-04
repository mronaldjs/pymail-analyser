import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { IMAPCredentials } from "@/types/api";

interface CredentialsFormProps {
  email: string;
  providerName: string;
  inferredHost: string;
  credentials: IMAPCredentials;
  setCredentials: (credentials: IMAPCredentials) => void;
  dateRangeMode: "preset" | "custom";
  setDateRangeMode: (mode: "preset" | "custom") => void;
  onBack: () => void;
  onAnalyze: () => void;
  onHelpClick: () => void;
}

export function CredentialsForm({
  email,
  providerName,
  inferredHost,
  credentials,
  setCredentials,
  dateRangeMode,
  setDateRangeMode,
  onBack,
  onAnalyze,
  onHelpClick,
}: CredentialsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Almost there!</h1>
        <p className="text-slate-400 text-sm">
          Provider detected:{" "}
          <span className="text-blue-400 font-semibold">{providerName}</span>
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm backdrop-blur-sm">
        <p className="text-slate-300">
          <span className="text-slate-400">Email:</span> {email}
        </p>
        <p className="text-slate-300 mt-2">
          <span className="text-slate-400">IMAP Host:</span>{" "}
          {inferredHost || "(Custom)"}
        </p>
      </div>

      <div className="space-y-4">
        {!inferredHost && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-medium text-white">
              Custom IMAP Host
            </label>
            <Input
              value={credentials.host}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  host: e.target.value,
                })
              }
              placeholder="imap.yourserver.com"
              className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-primary focus:ring-primary/50 transition-all"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">
              App Password or Password
            </label>
            <button
              type="button"
              onClick={onHelpClick}
              className="text-xs text-primary hover:text-accent hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle className="h-3 w-3" />
              How to generate?
            </button>
          </div>
          <Input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({
                ...credentials,
                password: e.target.value,
              })
            }
            placeholder="••••••••"
            required
            className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-primary focus:ring-primary/50 transition-all"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Use an app password if you have 2FA enabled
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-white">
            Analysis Period
          </label>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={dateRangeMode === "preset" ? "default" : "outline"}
              onClick={() => {
                setDateRangeMode("preset");
                setCredentials({
                  ...credentials,
                  start_date: undefined,
                  end_date: undefined,
                  days_limit: 30,
                });
              }}
              className="flex-1 cursor-pointer"
            >
              Preset
            </Button>
            <Button
              type="button"
              size="sm"
              variant={dateRangeMode === "custom" ? "default" : "outline"}
              onClick={() => {
                setDateRangeMode("custom");
                setCredentials({
                  ...credentials,
                  days_limit: undefined,
                });
              }}
              className="flex-1 cursor-pointer"
            >
              Custom
            </Button>
          </div>

          {dateRangeMode === "preset" ? (
            <select
              value={credentials.days_limit || 30}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  days_limit: parseInt(e.target.value),
                  start_date: undefined,
                  end_date: undefined,
                })
              }
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 6 months</option>
              <option value={365}>Last year</option>
            </select>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Start Date</label>
                <Input
                  type="date"
                  value={credentials.start_date || ""}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      start_date: e.target.value,
                      days_limit: undefined,
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  max={
                    credentials.end_date ||
                    new Date().toISOString().split("T")[0]
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">End Date</label>
                <Input
                  type="date"
                  value={credentials.end_date || ""}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      end_date: e.target.value,
                      days_limit: undefined,
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  min={credentials.start_date ?? undefined}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-slate-600 text-white hover:bg-slate-700 cursor-pointer"
        >
          Back
        </Button>
        <Button
          onClick={onAnalyze}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
          disabled={
            !credentials.password ||
            (dateRangeMode === "custom" &&
              (!credentials.start_date || !credentials.end_date))
          }
        >
          Analyze Inbox
        </Button>
      </div>
    </div>
  );
}
