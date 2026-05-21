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
          Detecting your email provider...
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@gmail.com"
            required
            className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-primary focus:ring-primary/50 transition-all"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold cursor-pointer shadow-lg shadow-primary/20 transition-all"
          disabled={!email}
        >
          Continue
        </Button>
      </form>

      <p className="text-xs text-slate-500 text-center">
        Your email will only be used to connect to your inbox
      </p>
    </div>
  );
}
