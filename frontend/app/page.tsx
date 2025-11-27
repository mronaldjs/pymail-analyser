'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { IMAPCredentials, AnalysisResponse, SenderStats, DeleteRequest } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trash2, MailX, LogOut } from 'lucide-react';

export default function Home() {
  const [credentials, setCredentials] = useState<IMAPCredentials>({
    host: 'imap.gmail.com',
    email: '',
    password: '',
    days_limit: 30
  });

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [senderToDelete, setSenderToDelete] = useState<SenderStats | null>(null);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (creds: IMAPCredentials) => {
      const response = await axios.post<AnalysisResponse>('http://localhost:8000/analyze', creds);
      return response.data;
    },
    onSuccess: (data) => {
      setData(data);
    },
    onError: (error: any) => {
      alert('Falha ao conectar: ' + (error.response?.data?.detail || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (senderEmail: string) => {
      const payload: DeleteRequest = {
        credentials,
        sender_emails: [senderEmail]
      };
      await axios.post('http://localhost:8000/delete', payload);
      return senderEmail;
    },
    onSuccess: (senderEmail) => {
      if (data) {
        setData({
          ...data,
          ignored_senders: data.ignored_senders.filter(s => s.sender_email !== senderEmail)
        });
      }
      setDeleteProgress(100);
      setTimeout(() => {
        setDeleteModalOpen(false);
        setSenderToDelete(null);
        setIsDeleting(false);
        setDeleteProgress(0);
      }, 500);
    },
    onError: (error: any) => {
      alert('Falha ao excluir: ' + (error.response?.data?.detail || error.message));
      setIsDeleting(false);
    }
  });

  // Simulate progress when deleting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDeleting && deleteProgress < 90) {
      interval = setInterval(() => {
        setDeleteProgress((prev) => {
          if (prev >= 90) return prev;
          // Logarithmic-ish progress simulation
          const diff = 90 - prev;
          return prev + Math.max(1, diff * 0.1);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isDeleting, deleteProgress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeMutation.mutate(credentials);
  };

  const handleUnsubscribe = (link: string) => {
    if (link.startsWith('mailto:')) {
      window.location.href = link;
    } else {
      window.open(link, '_blank');
    }
  };

  const confirmDelete = (sender: SenderStats) => {
    setSenderToDelete(sender);
    setDeleteModalOpen(true);
    setDeleteProgress(0);
  };

  const executeDelete = () => {
    if (senderToDelete) {
      setIsDeleting(true);
      deleteMutation.mutate(senderToDelete.sender_email);
    }
  };

  if (data) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel de Saúde da Caixa de Entrada</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={() => setData(null)}>
                <LogOut className="mr-2 h-4 w-4" /> Desconectar
              </Button>
            </div>
          </div>

          {/* Health Score */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pontuação de Saúde</CardTitle>
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
                <div className="text-2xl font-bold">{data.health_score}/100</div>
                <p className="text-xs text-muted-foreground">
                  Baseado no volume de spam e taxas de abertura
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">E-mails Analisados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.total_emails_scanned}</div>
                <p className="text-xs text-muted-foreground">
                  Dos últimos {credentials.days_limit} dias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Table */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Principais Ofensores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Remetente</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Qtd</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Taxa de Abertura</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pontuação Spam</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {data.ignored_senders.map((sender, i) => (
                      <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="font-medium">{sender.sender_name}</div>
                          <div className="text-xs text-muted-foreground">{sender.sender_email}</div>
                        </td>
                        <td className="p-4 align-middle">{sender.email_count}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            sender.open_rate < 20 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {sender.open_rate}%
                          </span>
                        </td>
                        <td className="p-4 align-middle font-bold">{sender.spam_score}</td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            {sender.unsubscribe_link && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleUnsubscribe(sender.unsubscribe_link!)}
                                title={sender.unsubscribe_link}
                              >
                                <MailX className="h-4 w-4 mr-1" /> Unsub
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => confirmDelete(sender)}
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
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Você está prestes a excluir todos os e-mails de <strong>{senderToDelete?.sender_name}</strong> ({senderToDelete?.sender_email}).
                  Esta ação moverá os itens para a Lixeira.
                </DialogDescription>
              </DialogHeader>
              
              {isDeleting && (
                <div className="py-4 space-y-2">
                  <Progress value={deleteProgress} className="w-full" />
                  <p className="text-xs text-center text-muted-foreground">Processando exclusão...</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={executeDelete} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Conectar Caixa de Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Host IMAP</label>
              <Input 
                value={credentials.host}
                onChange={(e) => setCredentials({...credentials, host: e.target.value})}
                placeholder="imap.gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input 
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                placeholder="voce@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha de App</label>
              <Input 
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use uma Senha de App se tiver 2FA ativado.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Período de Análise</label>
              <Select 
                value={credentials.days_limit?.toString()} 
                onValueChange={(value) => setCredentials({...credentials, days_limit: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="15">Últimos 15 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="60">Últimos 60 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" type="submit" disabled={analyzeMutation.isPending}>
              {analyzeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analisar Inbox
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
