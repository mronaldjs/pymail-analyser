import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProviderBlock({
  name,
  steps,
  href,
}: {
  name: string;
  steps: string[];
  href: string;
}) {
  return (
    <div className="space-y-2">
      <p className="eyebrow">{name}</p>
      <ol className="list-inside list-decimal space-y-1 pl-1 text-sm text-muted-foreground">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <Button
        variant="link"
        className="h-auto p-0 text-xs text-primary"
        onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
      >
        <ExternalLink className="mr-1 h-3 w-3" />
        Open settings
      </Button>
    </div>
  );
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <p className="eyebrow">Connecting your inbox</p>
          <DialogTitle className="text-xl">Generate an App Password</DialogTitle>
          <DialogDescription>
            Gmail, Google Workspace, Outlook and Yahoo no longer accept your
            normal password over IMAP. You must create an{" "}
            <strong className="text-foreground">App Password</strong> — which
            first requires <strong className="text-foreground">2-Step
            Verification (2FA)</strong> to be enabled.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-5 overflow-y-auto py-2">
          <ProviderBlock
            name="Gmail / Google Workspace"
            steps={[
              "Google Account → Security",
              "Enable 2-Step Verification",
              "Open App Passwords and generate one for PyMail",
            ]}
            href="https://myaccount.google.com/apppasswords"
          />
          <ProviderBlock
            name="Outlook / Microsoft 365"
            steps={[
              "Microsoft Account → Security → Advanced security",
              "Enable two-step verification",
              "Create a new App Password",
            ]}
            href="https://account.microsoft.com/security"
          />
          <ProviderBlock
            name="Yahoo Mail"
            steps={[
              "Yahoo Account → Account Security",
              "Generate app password → choose Other app",
              "Copy the password (without spaces)",
            ]}
            href="https://login.yahoo.com/account/security"
          />

          <div
            className="rounded-md border px-3 py-2 text-xs leading-relaxed"
            style={{
              color: "#e5c07b",
              borderColor: "rgba(229, 192, 123, 0.3)",
              backgroundColor: "rgba(229, 192, 123, 0.08)",
            }}
          >
            <strong>School / company accounts:</strong> a Workspace or Microsoft
            365 admin may disable App Passwords or IMAP entirely. If it still
            fails after creating one, IMAP is likely blocked — contact your IT
            admin, or use a personal account. (Google Workspace IMAP host:{" "}
            <code>imap.gmail.com</code>.)
          </div>

          <p className="text-xs text-muted-foreground">
            Your credentials are only used during this session — never stored,
            logged, or shared.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
