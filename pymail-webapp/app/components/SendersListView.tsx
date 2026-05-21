import { SenderStats } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Trash2, Archive, MailX } from "lucide-react";
import { cleanText } from "@/lib/cleanText";
import { getSenderKey } from "@/utils/senderSelection";

interface SendersListViewProps {
  senders: SenderStats[];
  selectedKeys: Set<string>;
  onToggleSelection: (key: string) => void;
  onToggleAllVisible: (
    visibleSenders: SenderStats[],
    allVisibleSelected: boolean,
  ) => void;
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
  const someVisibleSelected = senders.some((sender) =>
    selectedKeys.has(getSenderKey(sender)),
  );

  return (
    <div className="relative w-full overflow-auto rounded-xl border border-white/5 bg-background/30 backdrop-blur-md">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b border-white/10 bg-muted/20">
          <tr className="transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-background"
                checked={allVisibleSelected}
                aria-checked={
                  someVisibleSelected && !allVisibleSelected
                    ? "mixed"
                    : undefined
                }
                disabled={senders.length === 0}
                onChange={() => onToggleAllVisible(senders, allVisibleSelected)}
                aria-label="Select all visible"
              />
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Sender
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Count
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Open Rate
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Spam Score
            </th>
            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {senders.map((sender, i) => (
            <tr
              key={i}
              tabIndex={0}
              className="group border-b border-white/5 transition-all duration-300 ease-in-out hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/5 cursor-pointer data-[state=selected]:bg-primary/15 data-[state=selected]:shadow-xl data-[state=selected]:shadow-primary/10"
              onClick={() => onToggleSelection(getSenderKey(sender))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggleSelection(getSenderKey(sender));
                }
              }}
              data-state={
                selectedKeys.has(getSenderKey(sender)) ? "selected" : undefined
              }
            >
              <td className="p-4 align-middle">
                <input
                  type="checkbox"
                  className="rounded border-white/20"
                  checked={selectedKeys.has(getSenderKey(sender))}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => onToggleSelection(getSenderKey(sender))}
                  aria-label={`Select ${sender.sender_name}`}
                />
              </td>
              <td className="p-4 align-middle">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cleanText(sender.sender_name)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {cleanText(sender.source_key || sender.sender_email)}
                </div>
                {(sender.domain_reputation?.summary_en ||
                  sender.domain_reputation?.summary_pt) && (
                  <div
                    className="text-[10px] text-muted-foreground/60 mt-1.5 max-w-md bg-muted/30 p-1.5 rounded-md inline-block border border-white/5"
                    title="DNS query (MX/SPF/DMARC); VirusTotal only if VIRUSTOTAL_API_KEY is set on the server"
                  >
                    {cleanText(
                      sender.domain_reputation.summary_en ||
                        sender.domain_reputation.summary_pt,
                    )}
                  </div>
                )}
              </td>
              <td className="p-4 align-middle font-medium">
                {sender.email_count}
              </td>
              <td className="p-4 align-middle">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    sender.open_rate < 20
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}
                >
                  {sender.open_rate}%
                </span>
              </td>
              <td className="p-4 align-middle font-bold text-foreground">
                {sender.spam_score}
              </td>
              <td className="p-4 align-middle text-right">
                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                  {sender.unsubscribe_link && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onUnsubscribe(sender.unsubscribe_link!);
                      }}
                      title={sender.unsubscribe_link}
                      className="cursor-pointer border-white/10 hover:bg-white/5 h-8 px-2"
                    >
                      <MailX className="h-3.5 w-3.5 sm:mr-1" />{" "}
                      <span className="hidden sm:inline text-xs">Unsub</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onConfirmAction(sender, "archive");
                    }}
                    className="cursor-pointer bg-white/5 hover:bg-white/10 h-8 px-2"
                  >
                    <Archive className="h-3.5 w-3.5 sm:mr-1" />{" "}
                    <span className="hidden sm:inline text-xs">Archive</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      onConfirmAction(sender, "delete");
                    }}
                    className="cursor-pointer h-8 px-2 shadow-lg shadow-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:mr-1" />{" "}
                    <span className="hidden sm:inline text-xs">Delete</span>
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
