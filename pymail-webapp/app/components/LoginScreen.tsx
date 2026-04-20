import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { IMAPCredentials } from "@/types/api";
import { inferIMAPHost, getProviderName } from "@/utils/emailProviders";
import { EmailForm } from "./EmailForm";
import { CredentialsForm } from "./CredentialsForm";
import { HelpModal } from "./HelpModal";

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
      alert(
        "Domínio de email não reconhecido. Você terá que preencher o host IMAP manualmente.",
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Conectar Caixa de Entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <EmailForm
                email={email}
                setEmail={setEmail}
                onSubmit={handleEmailSubmit}
              />
            ) : (
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
            )}
          </CardContent>
        </Card>
      </main>

      <HelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
    </>
  );
}
