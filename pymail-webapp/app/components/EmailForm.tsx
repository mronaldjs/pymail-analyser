import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailFormProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmailForm({ email, setEmail, onSubmit }: EmailFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          PyMail Analyser
        </h1>
        <p className="text-slate-400">
          Detectando seu provedor de email...
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@gmail.com"
            required
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
          disabled={!email}
        >
          Continuar
        </Button>
      </form>

      <p className="text-xs text-slate-500 text-center">
        Seu email será usado apenas para conectar à sua caixa de entrada
      </p>
    </div>
  );
}
