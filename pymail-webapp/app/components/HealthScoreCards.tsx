import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMAPCredentials } from "@/types/api";

interface HealthScoreCardsProps {
  healthScore: number;
  totalEmailsScanned: number;
  credentials: IMAPCredentials;
}

export function HealthScoreCards({
  healthScore,
  totalEmailsScanned,
  credentials,
}: HealthScoreCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pontuação de Saúde
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{healthScore}/100</div>
          <p className="text-xs text-muted-foreground">
            Baseado no volume de spam e taxas de abertura
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            E-mails Analisados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmailsScanned}</div>
          <p className="text-xs text-muted-foreground">
            {credentials.start_date && credentials.end_date
              ? `De ${new Date(credentials.start_date).toLocaleDateString("pt-BR")} até ${new Date(credentials.end_date).toLocaleDateString("pt-BR")}`
              : `Dos últimos ${credentials.days_limit} dias`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
