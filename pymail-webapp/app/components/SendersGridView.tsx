import { SenderStats } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Archive, MailX } from "lucide-react";
import { cleanText } from "@/lib/cleanText";
import { getSenderKey } from "@/utils/senderSelection";
import { SpamRiskBadge } from "./SpamRiskBadge";

interface SendersGridViewProps {
  senders: SenderStats[];
  selectedKeys: Set<string>;
  onToggleSelection: (key: string) => void;
  onUnsubscribe: (link: string) => void;
  onConfirmAction: (sender: SenderStats, action: "archive" | "delete") => void;
}

export default function SendersGridView({
  senders,
  selectedKeys,
  onToggleSelection,
  onUnsubscribe,
  onConfirmAction,
}: SendersGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {senders.map((sender, i) => (
        <Card
          key={i}
          tabIndex={0}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onToggleSelection(getSenderKey(sender))}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onToggleSelection(getSenderKey(sender));
            }
          }}
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">
                    {sender.sender_name}
                  </h3>
                  <SpamRiskBadge risk={sender.spam_risk} />
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {cleanText(sender.source_key || sender.sender_email)}
                </p>
                {sender.domain_reputation?.summary_pt && (
                  <p
                    className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-2"
                    title="Consulta DNS (MX/SPF/DMARC); VirusTotal opcional no servidor"
                  >
                    {cleanText(sender.domain_reputation.summary_pt)}
                  </p>
                )}
              </div>
              <div className="ml-2 shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {sender.spam_score}
                </span>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={selectedKeys.has(getSenderKey(sender))}
                onClick={(event) => event.stopPropagation()}
                onChange={() => onToggleSelection(getSenderKey(sender))}
                aria-label={`Selecionar ${sender.sender_name}`}
              />
              Selecionar
            </label>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">E-mails</p>
                <p className="font-semibold">{sender.email_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taxa Abertura</p>
                <p className="font-semibold">
                  <span
                    className={`${sender.open_rate < 20 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                  >
                    {sender.open_rate}%
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {sender.unsubscribe_link && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    onUnsubscribe(sender.unsubscribe_link!);
                  }}
                  className="flex-1 cursor-pointer"
                  title={sender.unsubscribe_link}
                >
                  <MailX className="h-4 w-4 mr-1" /> Unsub
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={(event) => {
                  event.stopPropagation();
                  onConfirmAction(sender, "archive");
                }}
                className="flex-1 cursor-pointer"
              >
                <Archive className="h-4 w-4 mr-1" /> Arq
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onConfirmAction(sender, "delete");
                }}
                className="flex-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Del
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
