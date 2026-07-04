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
      <p className="text-sm text-muted-foreground">
        Enter your email — we&apos;ll detect your provider automatically.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@gmail.com"
            required
            autoFocus
          />
        </div>

        <Button type="submit" className="w-full" disabled={!email}>
          Continue
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Your email is only used to connect to your inbox.
      </p>
    </div>
  );
}
