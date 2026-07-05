import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSelector } from "./ThemeSelector";
import { IMAPCredentials } from "@/types/api";
import { inferIMAPHost, getProviderName } from "@/utils/emailProviders";
import { EmailForm } from "./EmailForm";
import { CredentialsForm } from "./CredentialsForm";
import { HelpModal } from "./HelpModal";
import { Lock } from "lucide-react";
import { popUpAlert } from "@/utils/alerts";

interface LoginScreenProps {
  onAnalyze: (credentials: IMAPCredentials) => void;
}

export function LoginScreen({ onAnalyze }: LoginScreenProps) {
  const [step, setStep] = useState<"email" | "credentials">("email");
  const [email, setEmail] = useState("");
  const [inferredHost, setInferredHost] = useState("");
  const [dateRangeMode, setDateRangeMode] = useState<"preset" | "custom">(
    "preset",
  );
  const [credentials, setCredentials] = useState<IMAPCredentials>({
    host: "",
    email: "",
    password: "",
    days_limit: 30,
  });
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const host = inferIMAPHost(email);

    if (!host) {
      popUpAlert(
        "Email domain not recognized — fill in the IMAP host manually.",
        "info",
      );
      setInferredHost("");
      setCredentials((prev) => ({ ...prev, email, host: "" }));
    } else {
      setInferredHost(host);
      setCredentials((prev) => ({ ...prev, email, host }));
    }

    setStep("credentials");
  };

  const handleBack = () => {
    setStep("email");
    setEmail("");
    setDateRangeMode("preset");
    setCredentials({
      host: "",
      email: "",
      password: "",
      days_limit: 30,
    });
  };

  const handleAnalyze = () => {
    onAnalyze(credentials);
  };

  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
        {/* Quiet ambient wash (accent radial). */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 22% 18%, rgba(var(--accent-rgb), 0.10), transparent 70%), radial-gradient(55% 45% at 80% 82%, rgba(var(--accent-rgb), 0.07), transparent 72%)",
          }}
        />

        <div className="absolute top-4 right-4 z-10">
          <ThemeSelector />
        </div>

        <div className="w-full max-w-md z-10">
          <Card className="relative overflow-hidden shadow-2xl">
            {/* Terminal chrome */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-destructive/70" />
              <span className="h-3 w-3 rounded-full bg-[#e5c07b]/70" />
              <span className="h-3 w-3 rounded-full bg-[#98c379]/70" />
              <span className="ml-3 text-xs text-muted-foreground">
                ~/connect
              </span>
            </div>
            <CardHeader className="pb-4">
              <p className="eyebrow">Secure IMAP session</p>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Connect inbox
              </CardTitle>
            </CardHeader>
            <CardContent className="transition-all duration-500 ease-in-out">
              {step === "email" ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <EmailForm
                    email={email}
                    setEmail={setEmail}
                    onSubmit={handleEmailSubmit}
                  />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <CredentialsForm
                    email={email}
                    providerName={getProviderName(email)}
                    inferredHost={inferredHost}
                    credentials={credentials}
                    setCredentials={setCredentials}
                    dateRangeMode={dateRangeMode}
                    setDateRangeMode={setDateRangeMode}
                    onBack={handleBack}
                    onAnalyze={handleAnalyze}
                    onHelpClick={() => setHelpModalOpen(true)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 w-full max-w-md">
          <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#98c379]" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-semibold text-foreground">
                Credentials Privacy
              </p>
              <p>
                Your IMAP credentials are used <strong>only</strong> in the
                current session to connect to your email server.{" "}
                <strong>Nothing is saved, stored, or shared</strong> — not in
                database, not in cookies, not in logs. When disconnecting, the
                data is discarded from memory.
              </p>
              <p>
                We recommend using an <strong>App Password</strong> instead of
                your main password.
              </p>
            </div>
          </div>
        </div>
      </main>

      <HelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
    </>
  );
}
