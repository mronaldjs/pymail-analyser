import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { IMAPCredentials } from "@/types/api";
import { requiresAppPassword, getProviderKind } from "@/utils/emailProviders";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Gmail / Google Workspace",
  microsoft: "Outlook / Microsoft 365",
  yahoo: "Yahoo Mail",
  proton: "ProtonMail",
  other: "This provider",
};

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
  const host = credentials.host || inferredHost;
  const needsAppPassword = requiresAppPassword(host);
  const providerLabel = PROVIDER_LABEL[getProviderKind(host)];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Almost there</p>
        <p className="text-sm text-muted-foreground">
          Provider detected:{" "}
          <span className="font-semibold text-primary">{providerName}</span>
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <p className="text-foreground">
          <span className="text-muted-foreground">Email:</span> {email}
        </p>
        <p className="mt-2 text-foreground">
          <span className="text-muted-foreground">IMAP Host:</span>{" "}
          {inferredHost || "(Custom)"}
        </p>
      </div>

      <div className="space-y-4">
        {!inferredHost && (
          <div className="space-y-2 duration-300 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-medium text-foreground">
              Custom IMAP Host <span className="text-destructive">*</span>
            </label>
            <Input
              value={credentials.host}
              onChange={(e) =>
                setCredentials({ ...credentials, host: e.target.value })
              }
              placeholder="imap.yourserver.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              We couldn&apos;t detect your provider — enter your IMAP host (e.g.{" "}
              <code>imap.gmail.com</code>) to continue.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              App Password or Password
            </label>
            <button
              type="button"
              onClick={onHelpClick}
              className="flex cursor-pointer items-center gap-1 text-xs text-primary transition-colors hover:underline"
            >
              <HelpCircle className="h-3 w-3" />
              How to generate?
            </button>
          </div>
          <Input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            placeholder="••••••••"
            required
            autoFocus
          />
          {needsAppPassword ? (
            <p
              className="rounded-md border px-2.5 py-1.5 text-xs leading-relaxed"
              style={{
                color: "#e5c07b",
                borderColor: "rgba(229, 192, 123, 0.3)",
                backgroundColor: "rgba(229, 192, 123, 0.08)",
              }}
            >
              <strong>{providerLabel}</strong> requires an{" "}
              <strong>App Password</strong> — your normal password won&apos;t
              work. Turn on 2-Step Verification, then generate one via
              &ldquo;How to generate?&rdquo; above.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Use an app password if your provider requires one (recommended
              with 2FA).
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
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
              className="flex-1"
            >
              Preset
            </Button>
            <Button
              type="button"
              size="sm"
              variant={dateRangeMode === "custom" ? "default" : "outline"}
              onClick={() => {
                setDateRangeMode("custom");
                setCredentials({ ...credentials, days_limit: undefined });
              }}
              className="flex-1"
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
              className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                <label className="text-xs text-muted-foreground">
                  Start Date
                </label>
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
                  max={
                    credentials.end_date ||
                    new Date().toISOString().split("T")[0]
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  End Date
                </label>
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
                  min={credentials.start_date ?? undefined}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button
          onClick={onAnalyze}
          className="flex-1"
          disabled={
            !credentials.password ||
            !credentials.host.trim() ||
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
