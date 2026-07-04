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

const TH =
  "h-11 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground";

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
    <div className="relative w-full overflow-auto rounded-xl border border-border bg-card">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-border">
          <tr>
            <th className={`${TH} w-12`}>
              <input
                type="checkbox"
                className="rounded border-border accent-primary"
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
            <th className={TH}>Sender</th>
            <th className={TH}>Count</th>
            <th className={TH}>Open Rate</th>
            <th className={TH}>Spam Score</th>
            <th className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {senders.map((sender, i) => (
            <tr
              key={i}
              tabIndex={0}
              className="group cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/30 focus-visible:outline-none focus-visible:bg-muted/30 data-[state=selected]:border-primary/20 data-[state=selected]:bg-primary/10"
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
                  className="rounded border-border accent-primary"
                  checked={selectedKeys.has(getSenderKey(sender))}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => onToggleSelection(getSenderKey(sender))}
                  aria-label={`Select ${sender.sender_name}`}
                />
              </td>
              <td className="p-4 align-middle">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {cleanText(sender.sender_name)}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {cleanText(sender.source_key || sender.sender_email)}
                </div>
                {(sender.domain_reputation?.summary_en ||
                  sender.domain_reputation?.summary_pt) && (
                  <div
                    className="mt-1.5 inline-block max-w-md rounded-md border border-border bg-muted/30 p-1.5 text-[10px] text-muted-foreground/70"
                    title="DNS query (MX/SPF/DMARC); VirusTotal only if VIRUSTOTAL_API_KEY is set on the server"
                  >
                    {cleanText(
                      sender.domain_reputation.summary_en ||
                        sender.domain_reputation.summary_pt,
                    )}
                  </div>
                )}
              </td>
              <td className="p-4 align-middle font-medium tabular-nums">
                {sender.email_count}
              </td>
              <td className="p-4 align-middle">
                <span
                  className="inline-flex items-center gap-1.5 text-xs tabular-nums"
                  style={{ color: sender.open_rate < 20 ? "#f7768e" : "#98c379" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        sender.open_rate < 20 ? "#f7768e" : "#98c379",
                    }}
                  />
                  {sender.open_rate}%
                </span>
              </td>
              <td className="p-4 align-middle font-bold tabular-nums text-foreground">
                {sender.spam_score}
              </td>
              <td className="p-4 align-middle text-right">
                <div className="flex justify-end gap-2 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                  {sender.unsubscribe_link && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onUnsubscribe(sender.unsubscribe_link!);
                      }}
                      title={sender.unsubscribe_link}
                      className="h-8 px-2"
                    >
                      <MailX className="h-3.5 w-3.5 sm:mr-1" />
                      <span className="hidden text-xs sm:inline">Unsub</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onConfirmAction(sender, "archive");
                    }}
                    className="h-8 px-2"
                  >
                    <Archive className="h-3.5 w-3.5 sm:mr-1" />
                    <span className="hidden text-xs sm:inline">Archive</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      onConfirmAction(sender, "delete");
                    }}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:mr-1" />
                    <span className="hidden text-xs sm:inline">Delete</span>
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
