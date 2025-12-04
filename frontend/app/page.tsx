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
import { Loader2, Trash2, MailX, LogOut, CheckCircle2, LayoutGrid, List, HelpCircle, ExternalLink, Archive } from 'lucide-react';
import { inferIMAPHost, getProviderName } from '@/utils/emailProviders';

export default function Home() {
  const [step, setStep] = useState<'email' | 'credentials'>('email');
  const [email, setEmail] = useState('');
  const [inferredHost, setInferredHost] = useState('');
  const [dateRangeMode, setDateRangeMode] = useState<'preset' | 'custom'>('preset');
  const [credentials, setCredentials] = useState<IMAPCredentials>({
    host: '',
    email: '',
    password: '',
    days_limit: 30
  });

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'archive'>('delete');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [senderToAction, setSenderToAction] = useState<SenderStats | null>(null);
  const [actionProgress, setActionProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStatus, setActionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (creds: IMAPCredentials) => {
      setIsLoading(true);
      const response = await axios.post<AnalysisResponse>('http://localhost:8000/analyze', creds);
      return response.data;
    },
    onSuccess: (data) => {
      setIsLoading(false);
      setData(data);
    },
    onError: (error: any) => {
      setIsLoading(false);
      alert('Falha ao conectar: ' + (error.response?.data?.detail || error.message));
    }
  });

  const actionMutation = useMutation({
    mutationFn: async ({ senderEmail, type }: { senderEmail: string, type: 'delete' | 'archive' }) => {
      setActionStatus('processing');
      const payload: DeleteRequest = {
        credentials,
        sender_emails: [senderEmail]
      };
      const endpoint = type === 'delete' ? 'delete' : 'archive';
      await axios.post(`http://localhost:8000/${endpoint}`, payload);
      return { senderEmail, type };
    },
    onSuccess: ({ senderEmail, type }) => {
      if (data) {
        setData({
          ...data,
          ignored_senders: data.ignored_senders.filter(s => s.sender_email !== senderEmail)
        });
      }
      setActionProgress(100);
      setActionStatus('success');
      setTimeout(() => {
        setActionModalOpen(false);
        setSenderToAction(null);
        setIsProcessing(false);
        setActionProgress(0);
        setActionStatus('idle');
      }, 1500);
    },
    onError: (error: any) => {
      setActionStatus('error');
      alert(`Falha ao ${actionType === 'delete' ? 'excluir' : 'arquivar'}: ` + (error.response?.data?.detail || error.message));
      setIsProcessing(false);
      setTimeout(() => {
        setActionStatus('idle');
      }, 2000);
    }
  });

  // Simulate progress when processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing && actionProgress < 90) {
      interval = setInterval(() => {
        setActionProgress((prev) => {
          if (prev >= 90) return prev;
          // Logarithmic-ish progress simulation
          const diff = 90 - prev;
          return prev + Math.max(1, diff * 0.1);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isProcessing, actionProgress]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const host = inferIMAPHost(email);
    
    if (!host) {
      alert('Domínio de email não reconhecido. Você terá que preencher o host IMAP manualmente.');
      setInferredHost('');
      setCredentials(prev => ({ ...prev, email, host: '' }));
    } else {
      setInferredHost(host);
      setCredentials(prev => ({ ...prev, email, host }));
    }
    
    setStep('credentials');
  };

  const handleUnsubscribe = (link: string) => {
    if (link.startsWith('mailto:')) {
      window.location.href = link;
    } else {
      window.open(link, '_blank');
    }
  };

  const confirmAction = (sender: SenderStats, type: 'delete' | 'archive') => {
    setSenderToAction(sender);
    setActionType(type);
    setActionModalOpen(true);
    setActionProgress(0);
  };

  const executeAction = () => {
    if (senderToAction) {
      setIsProcessing(true);
      actionMutation.mutate({ senderEmail: senderToAction.sender_email, type: actionType });
    }
  };

  const handleAnalyze = () => {
    analyzeMutation.mutate(credentials);
  };

  // Loading screen durante análise
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-16 h-16">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Analisando sua caixa de entrada...</h2>
            <p className="text-slate-400">Isso pode levar alguns segundos</p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (data) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel da Caixa de Entrada</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={() => setData(null)} className="cursor-pointer">
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
                  {credentials.start_date && credentials.end_date 
                    ? `De ${new Date(credentials.start_date).toLocaleDateString('pt-BR')} até ${new Date(credentials.end_date).toLocaleDateString('pt-BR')}`
                    : `Dos últimos ${credentials.days_limit} dias`
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Grid or List */}
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Principais Ofensores</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className="cursor-pointer"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                    className="cursor-pointer"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'list' ? (
                // LIST VIEW
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
                                className="cursor-pointer"
                              >
                                <MailX className="h-4 w-4 mr-1" /> Unsub
                              </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => confirmAction(sender, 'archive')}
                                className="cursor-pointer"
                              >
                                <Archive className="h-4 w-4 mr-1" /> Arquivar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => confirmAction(sender, 'delete')}
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
              ) : (
                // GRID VIEW
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.ignored_senders.map((sender, i) => (
                    <Card key={i} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{sender.sender_name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{sender.sender_email}</p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {sender.spam_score}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">E-mails</p>
                            <p className="font-semibold">{sender.email_count}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Taxa Abertura</p>
                            <p className="font-semibold">
                              <span className={`${sender.open_rate < 20 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
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
                              onClick={() => handleUnsubscribe(sender.unsubscribe_link!)}
                              className="flex-1 cursor-pointer"
                              title={sender.unsubscribe_link}
                            >
                              <MailX className="h-4 w-4 mr-1" /> Unsub
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => confirmAction(sender, 'archive')}
                            className="flex-1 cursor-pointer"
                          >
                            <Archive className="h-4 w-4 mr-1" /> Arq
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => confirmAction(sender, 'delete')}
                            className="flex-1 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Del
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Confirmation Dialog (Delete/Archive) */}
          <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{actionType === 'delete' ? 'Confirmar Exclusão' : 'Confirmar Arquivamento'}</DialogTitle>
                <DialogDescription>
                  Você está prestes a {actionType === 'delete' ? 'excluir' : 'arquivar'} todos os e-mails de <strong>{senderToAction?.sender_name}</strong> ({senderToAction?.sender_email}).
                  {actionType === 'delete' ? ' Esta ação moverá os itens para a Lixeira.' : ' Os e-mails serão movidos para o arquivo.'}
                </DialogDescription>
              </DialogHeader>
              
              {actionStatus === 'idle' && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setActionModalOpen(false)} disabled={isProcessing} className="cursor-pointer">
                    Cancelar
                  </Button>
                  <Button 
                    variant={actionType === 'delete' ? 'destructive' : 'secondary'} 
                    onClick={executeAction} 
                    disabled={isProcessing} 
                    className="cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : actionType === 'delete' ? (
                      <Trash2 className="mr-2 h-4 w-4" />
                    ) : (
                      <Archive className="mr-2 h-4 w-4" />
                    )}
                    Confirmar {actionType === 'delete' ? 'Exclusão' : 'Arquivamento'}
                  </Button>
                </DialogFooter>
              )}

              {actionStatus === 'processing' && (
                <div className="py-6 space-y-4">
                  <div className="flex justify-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <Progress value={actionProgress} className="w-full" />
                    <p className="text-xs text-center text-muted-foreground">
                      {actionType === 'delete' ? 'Excluindo' : 'Arquivando'} e-mails: {Math.round(actionProgress)}%
                    </p>
                  </div>
                </div>
              )}

              {actionStatus === 'success' && (
                <div className="py-6 space-y-4 text-center">
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-green-600">{actionType === 'delete' ? 'Exclusão' : 'Arquivamento'} concluído!</p>
                    <p className="text-sm text-muted-foreground">
                      Os e-mails de {senderToAction?.sender_name} foram {actionType === 'delete' ? 'movidos para a Lixeira' : 'arquivados'}.
                    </p>
                  </div>
                </div>
              )}

              {actionStatus === 'error' && (
                <div className="py-6 space-y-4 text-center">
                  <div className="flex justify-center">
                    <MailX className="w-12 h-12 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-red-600">Erro no {actionType === 'delete' ? 'exclusão' : 'arquivamento'}</p>
                    <p className="text-sm text-muted-foreground">
                      Verifique sua conexão e tente novamente.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActionModalOpen(false);
                      setActionStatus('idle');
                    }}
                    className="w-full cursor-pointer"
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Conectar Caixa de Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            // TELA 1: Apenas email
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">PyMail Analyser</h1>
                <p className="text-slate-400">Detectando seu provedor de email...</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">E-mail</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                  disabled={!email}
                >
                  Continuar
                </Button>
              </form>

              <p className="text-xs text-slate-500 text-center">
                Seu email será usado apenas para conectar à sua caixa de entrada
              </p>
            </div>
          ) : (
            // TELA 2: Credenciais
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Quase lá!</h1>
                <p className="text-slate-400 text-sm">
                  Provedor detectado: <span className="text-blue-400 font-semibold">{getProviderName(email)}</span>
                </p>
              </div>

              <div className="bg-slate-700 rounded p-4 text-sm">
                <p className="text-slate-300">
                  <span className="text-slate-400">Email:</span> {email}
                </p>
                <p className="text-slate-300 mt-2">
                  <span className="text-slate-400">Host IMAP:</span> {inferredHost || '(Personalizado)'}
                </p>
              </div>

              <div className="space-y-4">
                {!inferredHost && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Host IMAP Personalizado</label>
                    <Input
                      value={credentials.host}
                      onChange={(e) => setCredentials({ ...credentials, host: e.target.value })}
                      placeholder="imap.seuservidor.com"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Senha de App ou Senha</label>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Botão clicado!');
                        setHelpModalOpen(true);
                        console.log('Modal deve estar aberto');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="h-3 w-3" />
                      Como gerar?
                    </button>
                  </div>
                  <Input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500">
                    Use uma "Senha de App" se tiver 2FA ativado
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Período de Análise</label>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={dateRangeMode === 'preset' ? 'default' : 'outline'}
                      onClick={() => {
                        setDateRangeMode('preset');
                        setCredentials({ ...credentials, start_date: undefined, end_date: undefined, days_limit: 30 });
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      Predefinido
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={dateRangeMode === 'custom' ? 'default' : 'outline'}
                      onClick={() => {
                        setDateRangeMode('custom');
                        setCredentials({ ...credentials, days_limit: undefined });
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      Personalizado
                    </Button>
                  </div>

                  {dateRangeMode === 'preset' ? (
                    <select
                      value={credentials.days_limit || 30}
                      onChange={(e) => setCredentials({ ...credentials, days_limit: parseInt(e.target.value), start_date: undefined, end_date: undefined })}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                    >
                      <option value={7}>Últimos 7 dias</option>
                      <option value={30}>Últimos 30 dias</option>
                      <option value={90}>Últimos 90 dias</option>
                      <option value={180}>Últimos 6 meses</option>
                      <option value={365}>Último ano</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Data Inicial</label>
                        <Input
                          type="date"
                          value={credentials.start_date || ''}
                          onChange={(e) => setCredentials({ ...credentials, start_date: e.target.value, days_limit: undefined })}
                          className="bg-slate-700 border-slate-600 text-white"
                          max={credentials.end_date || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Data Final</label>
                        <Input
                          type="date"
                          value={credentials.end_date || ''}
                          onChange={(e) => setCredentials({ ...credentials, end_date: e.target.value, days_limit: undefined })}
                          className="bg-slate-700 border-slate-600 text-white"
                          min={credentials.start_date}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setStep('email');
                    setEmail('');
                    setDateRangeMode('preset');
                    setCredentials({ host: '', email: '', password: '', days_limit: 30 });
                  }}
                  variant="outline"
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700 cursor-pointer"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleAnalyze}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                  disabled={!credentials.password || (dateRangeMode === 'custom' && (!credentials.start_date || !credentials.end_date))}
                >
                  Analisar Inbox
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </main>

      {/* Help Modal - App Password Instructions */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Como gerar Senha de App</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Gmail / Google Workspace</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
                <li>Acesse Conta Google → Segurança</li>
                <li>Ative Verificação em 2 etapas</li>
                <li>Procure "Senhas de app"</li>
                <li>Gere nova senha para "PyMail Analyser"</li>
              </ol>
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={() => window.open('https://myaccount.google.com/apppasswords', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir configurações do Google
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Outlook / Hotmail</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
                <li>Acesse Segurança da conta Microsoft</li>
                <li>Vá em "Opções de segurança avançadas"</li>
                <li>Clique em "Senhas de aplicativo"</li>
                <li>Crie nova senha</li>
              </ol>
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={() => window.open('https://account.microsoft.com/security', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir configurações da Microsoft
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Yahoo Mail</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
                <li>Acesse Segurança da conta Yahoo</li>
                <li>Clique em "Gerar senha de app"</li>
                <li>Escolha "Outro aplicativo"</li>
                <li>Copie a senha (sem espaços)</li>
              </ol>
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={() => window.open('https://login.yahoo.com/account/security', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir configurações do Yahoo
              </Button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs">
                ⚠️ <strong>Importante:</strong> Suas credenciais não são armazenadas e são usadas apenas durante a sessão.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setHelpModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
