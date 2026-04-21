import { SenderStats } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Trash2, Archive, MailX } from "lucide-react";
import { cleanText } from "@/lib/cleanText";
import { getSenderKey } from "@/utils/senderSelection";
import { SpamRiskBadge } from "./SpamRiskBadge";

interface SendersListViewProps {
  senders: SenderStats[];
  selectedKeys: Set<string>;
  onToggleSelection: (key: string) => void;
  onToggleAllVisible: (visibleSenders: SenderStats[], allVisibleSelected: boolean) => void;
  onUnsubscribe: (link: string) => void;
  onConfirmAction: (sender: SenderStats, action: "archive" | "delete") => void;
}

export default function SendersListView({
  senders,
  selectedKeys,
  onToggleSelection,
  onToggleAllVisible,
  onUnsubscribe,
  onConfirmAction,
}: SendersListViewProps) {
  const allVisibleSelected =
    senders.length > 0 &&
    senders.every((sender) => selectedKeys.has(getSenderKey(sender)));
  const someVisibleSelected =
    senders.some((sender) => selectedKeys.has(getSenderKey(sender)));

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                aria-checked={someVisibleSelected && !allVisibleSelected ? "mixed" : undefined}
                disabled={senders.length === 0}
                onChange={() => onToggleAllVisible(senders, allVisibleSelected)}
                aria-label="Selecionar todos visíveis"
              />
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Remetente / risco
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Qtd
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Taxa de Abertura
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Pontuação Spam
            </th>
            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {senders.map((sender, i) => (
            <tr
              key={i}
              tabIndex={0}
              className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={() => onToggleSelection(getSenderKey(sender))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggleSelection(getSenderKey(sender));
                }
              }}
            >
              <td className="p-4 align-middle">
                <input
                  type="checkbox"
                  checked={selectedKeys.has(getSenderKey(sender))}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => onToggleSelection(getSenderKey(sender))}
                  aria-label={`Selecionar ${sender.sender_name}`}
                />
              </td>
              <td className="p-4 align-middle">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {cleanText(sender.sender_name)}
                  </span>
                  <SpamRiskBadge risk={sender.spam_risk} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {cleanText(sender.source_key || sender.sender_email)}
                </div>
                {sender.domain_reputation?.summary_pt && (
                  <div
                    className="text-xs text-muted-foreground/80 mt-1 max-w-md"
                    title="Consulta DNS (MX/SPF/DMARC); VirusTotal apenas se VIRUSTOTAL_API_KEY estiver definida no servidor"
                  >
                    {cleanText(sender.domain_reputation.summary_pt)}
                  </div>
                )}
              </td>
              <td className="p-4 align-middle">{sender.email_count}</td>
              <td className="p-4 align-middle">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    sender.open_rate < 20
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {sender.open_rate}%
                </span>
              </td>
              <td className="p-4 align-middle font-bold">
                {sender.spam_score}
              </td>
              <td className="p-4 align-middle text-right">
                <div className="flex justify-end gap-2">
                  {sender.unsubscribe_link && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onUnsubscribe(sender.unsubscribe_link!);
                      }}
                      title={sender.unsubscribe_link}
                      className="cursor-pointer"
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
                    className="cursor-pointer"
                  >
                    <Archive className="h-4 w-4 mr-1" /> Arquivar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      onConfirmAction(sender, "delete");
                    }}
                    className="cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
