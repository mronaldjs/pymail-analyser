import {
  Dialog,
  DialogContent,
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

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How to Generate App Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Gmail / Google Workspace</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
              <li>Go to Google Account → Security</li>
              <li>Enable 2-Step Verification</li>
              <li>Look for App Passwords</li>
              <li>Generate new password for PyMail Analyser</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() =>
                window.open(
                  "https://myaccount.google.com/apppasswords",
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Google Settings
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Outlook / Hotmail</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
              <li>Go to Microsoft Account Security</li>
              <li>Go to Advanced security options</li>
              <li>Click on App Passwords</li>
              <li>Create new password</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() =>
                window.open(
                  "https://account.microsoft.com/security",
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Microsoft Settings
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Yahoo Mail</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
              <li>Go to Yahoo Account Security</li>
              <li>Click on Generate app password</li>
              <li>Choose Other app</li>
              <li>Copy the password (without spaces)</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() =>
                window.open(
                  "https://login.yahoo.com/account/security",
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Yahoo Settings
            </Button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs">
              ⚠️ <strong>Important:</strong> Your credentials are not
              stored and are only used during the session.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
