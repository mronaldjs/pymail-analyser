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
        <h1 className="text-2xl font-bold text-white mb-1">Quase lá!</h1>
        <p className="text-slate-400 text-sm">
          Provedor detectado:{" "}
          <span className="text-blue-400 font-semibold">{providerName}</span>
        </p>
      </div>

      <div className="bg-slate-700 rounded p-4 text-sm">
        <p className="text-slate-300">
          <span className="text-slate-400">Email:</span> {email}
        </p>
        <p className="text-slate-300 mt-2">
          <span className="text-slate-400">Host IMAP:</span>{" "}
          {inferredHost || "(Personalizado)"}
        </p>
      </div>

      <div className="space-y-4">
        {!inferredHost && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Host IMAP Personalizado
            </label>
            <Input
              value={credentials.host}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  host: e.target.value,
                })
              }
              placeholder="imap.seuservidor.com"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">
              Senha de App ou Senha
            </label>
            <button
              type="button"
              onClick={onHelpClick}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="h-3 w-3" />
              Como gerar?
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
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            autoFocus
          />
          <p className="text-xs text-slate-500">
            Use uma senha de app se tiver 2FA ativado
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-white">
            Período de Análise
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
              Predefinido
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
              Personalizado
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
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
              <option value={180}>Últimos 6 meses</option>
              <option value={365}>Último ano</option>
            </select>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Data Inicial</label>
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
                <label className="text-xs text-slate-400">Data Final</label>
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
                  min={credentials.start_date}
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
          Voltar
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
          Analisar Inbox
        </Button>
      </div>
    </div>
  );
}
