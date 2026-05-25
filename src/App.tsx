/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Plano, Glosa, Recurso, SystemNotification } from './types';
import {
  getPlanos,
  savePlanos,
  getGlosas,
  saveGlosas,
  getRecursos,
  saveRecursos,
  getNotifications,
  saveNotifications,
  resetData,
} from './utils/storage';
import {
  LayoutDashboard,
  ShieldAlert,
  FilePlus2,
  Users2,
  FileSpreadsheet,
  AlertCircle,
  FolderOpenDot,
  RotateCcw,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  User,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';

import DashboardView from './components/DashboardView';
import GlosasView from './components/GlosasView';
import RecursosView from './components/RecursosView';
import PlanosView from './components/PlanosView';
import RelatoriosView from './components/RelatoriosView';

type Tab = 'dashboard' | 'glosas' | 'recursos' | 'planos' | 'relatorios';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Dynamic states fed from Storage
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [glosas, setGlosas] = useState<Glosa[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Push notifications active toast stack
  const [toasts, setToasts] = useState<SystemNotification[]>([]);

  // Drawer status
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Simulation loader status to convey network dispatch delay
  const [simulationLoading, setSimulationLoading] = useState<string | null>(null);

  // Intermediate helper for linking glosas and resources creation
  const [focusedGlosaId, setFocusedGlosaId] = useState<number | null>(null);

  // Success alerting messages banner
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Initialize data on load
  useEffect(() => {
    setPlanos(getPlanos());
    setGlosas(getGlosas());
    setRecursos(getRecursos());
    setNotifications(getNotifications());
  }, []);

  // Set up auto-dismiss for toasts
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        // Remove oldest toast
        setToasts(prev => prev.slice(0, prev.length - 1));
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Helper to trigger timed auto-dismiss alerts
  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage(null);
    }, 4000);
  };

  // central notification pipeline
  const addNotification = (
    title: string,
    description: string,
    type: 'status_change' | 'assignment' | 'alert' | 'success',
    glosaId?: number,
    recursoId?: number
  ) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      description,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      glosaId,
      recursoId,
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      saveNotifications(updated);
      return updated;
    });

    // Animate custom slide-in toast
    setToasts(prev => [newNotif, ...prev]);

    // Optional subtle standard web audio sound feedback!
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note (friendly chirp)
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Browser blocked autoplay or unsupported, failsafe ignore
    }
  };

  // Resets local storage back to defaults
  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar os dados iniciais do sistema? Esta ação irá reinicializar os layouts, notificações e apagar dados personalizados.')) {
      resetData();
      setPlanos(getPlanos());
      setGlosas(getGlosas());
      setRecursos(getRecursos());
      setNotifications(getNotifications());
      setToasts([]);
      setActiveTab('dashboard');
      showBanner('Dados originais e notificações restaurados com sucesso!');
    }
  };

  // ==================== Planos CRUD Handles ====================
  const handleAddPlano = (newPlano: Omit<Plano, 'id'>) => {
    const nextId = planos.length > 0 ? Math.max(...planos.map(p => p.id)) + 1 : 1;
    const item: Plano = { id: nextId, ...newPlano };
    const updated = [...planos, item];
    setPlanos(updated);
    savePlanos(updated);
    showBanner(`Convênio "${item.nome}" cadastrado com sucesso!`);
  };

  const handleEditPlano = (editedPlano: Plano) => {
    const updated = planos.map(p => p.id === editedPlano.id ? editedPlano : p);
    setPlanos(updated);
    savePlanos(updated);
    showBanner(`Convênio "${editedPlano.nome}" atualizado!`);
  };

  const handleDeletePlano = (id: number) => {
    // Foreign Key cascade simulated:
    // Delete corresponding glosas first, then delete plano
    const updatedPlanos = planos.filter(p => p.id !== id);
    const deletedGlosaIds = glosas.filter(g => g.planoId === id).map(g => g.id);
    const updatedGlosas = glosas.filter(g => g.planoId !== id);

    // Also delete resources associated with those glosas
    const updatedRecursos = recursos.filter(r => !deletedGlosaIds.includes(r.glosaId));

    setPlanos(updatedPlanos);
    savePlanos(updatedPlanos);

    setGlosas(updatedGlosas);
    saveGlosas(updatedGlosas);

    setRecursos(updatedRecursos);
    saveRecursos(updatedRecursos);

    showBanner(`Convênio #ID ${id} e todas as suas glosas/recursos associados foram deletados.`);
  };

  // ==================== Glosas CRUD Handles ====================
  const handleAddGlosa = (newGlosa: Omit<Glosa, 'id'>) => {
    const nextId = glosas.length > 0 ? Math.max(...glosas.map(g => g.id)) + 1 : 1;
    const item: Glosa = { id: nextId, ...newGlosa };
    const updated = [...glosas, item];
    setGlosas(updated);
    saveGlosas(updated);
    showBanner(`Glosa de ${item.paciente} registrada com sucesso (Protocolo de origem ${item.numeroGuia}).`);

    // ASSIGNMENT TO CURRENT USER DETECTED
    if (item.responsavel === 'Fábio Cruz') {
      addNotification(
        '📌 Nova Glosa Atribuída a Você',
        `A glosa do prestador ${item.paciente} (Protocolo de origem ${item.numeroGuia}, Valor ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorGlosado)}) foi registrada e atribuída a seu fluxo.`,
        'assignment',
        item.id
      );
    }
  };

  const handleEditGlosa = (editedGlosa: Glosa) => {
    const originalGlosa = glosas.find(g => g.id === editedGlosa.id);
    const updated = glosas.map(g => g.id === editedGlosa.id ? editedGlosa : g);
    setGlosas(updated);
    saveGlosas(updated);
    showBanner(`Glosa de ${editedGlosa.paciente} atualizada!`);

    if (originalGlosa) {
      // 1. ASSIGNMENT CHANGE DETECTED
      if (editedGlosa.responsavel !== originalGlosa.responsavel && editedGlosa.responsavel === 'Fábio Cruz') {
        addNotification(
          '📌 Glosa Atribuída a Você',
          `A glosa do prestador ${editedGlosa.paciente} (Protocolo de origem ${editedGlosa.numeroGuia}) foi reatribuída para você pelo administrador do faturamento.`,
          'assignment',
          editedGlosa.id
        );
      }

      // 2. STATUS CHANGE DETECTED
      if (editedGlosa.status !== originalGlosa.status) {
        addNotification(
          '🔄 Status da Glosa Modificado',
          `A glosa do prestador ${editedGlosa.paciente} (Origem: ${editedGlosa.numeroGuia}) mudou de "${originalGlosa.status}" para "${editedGlosa.status}".`,
          'status_change',
          editedGlosa.id
        );
      }
    }
  };

  const handleDeleteGlosa = (id: number) => {
    // Delete glosa and cascade delete corresponding resource
    const updatedGlosas = glosas.filter(g => g.id !== id);
    const updatedRecursos = recursos.filter(r => r.glosaId !== id);

    setGlosas(updatedGlosas);
    saveGlosas(updatedGlosas);

    setRecursos(updatedRecursos);
    saveRecursos(updatedRecursos);

    showBanner(`Glosa #ID ${id} e recursos pertinentes foram excluídos.`);
  };

  // ==================== Recursos CRUD Handles ====================
  const handleAddRecurso = (newRecurso: Omit<Recurso, 'id'>) => {
    const nextId = recursos.length > 0 ? Math.max(...recursos.map(r => r.id)) + 1 : 1;
    const item: Recurso = { id: nextId, ...newRecurso };
    const updated = [...recursos, item];
    setRecursos(updated);
    saveRecursos(updated);

    // Automatically cascade update status of associated Glosa to "Em recurso"
    const targetGlosa = glosas.find(g => g.id === item.glosaId);
    if (targetGlosa) {
      const updatedGlosas = glosas.map(g => {
        if (g.id === item.glosaId) {
          return { ...g, status: 'Em recurso' as const };
        }
        return g;
      });
      setGlosas(updatedGlosas);
      saveGlosas(updatedGlosas);
    }

    showBanner(`Recurso protocolado para o prestador com sucesso!`);

    const pName = targetGlosa ? targetGlosa.paciente : 'Prestador';
    addNotification(
      '📝 Novo Recurso Elaborado',
      `O recurso clínico do Protocolo de origem ${targetGlosa?.numeroGuia || ''} (${pName}) foi gerado e está "Aguardando" manifestação do plano.`,
      'status_change',
      item.glosaId,
      item.id
    );
  };

  const handleEditRecurso = (editedRecurso: Recurso) => {
    const originalRec = recursos.find(r => r.id === editedRecurso.id);
    const updated = recursos.map(r => r.id === editedRecurso.id ? editedRecurso : r);
    setRecursos(updated);
    saveRecursos(updated);

    // Cascade update status of associated Glosa if resource is Deferido -> status of Glosa = Finalizada, etc.
    const targetGlosa = glosas.find(g => g.id === editedRecurso.glosaId);
    if (targetGlosa) {
      let nextGlosaStatus = targetGlosa.status;
      if (editedRecurso.status === 'Deferido') {
        nextGlosaStatus = 'Finalizada' as const;
      } else if (editedRecurso.status === 'Indeferido') {
        nextGlosaStatus = 'Finalizada' as const;
      } else {
        nextGlosaStatus = 'Em recurso' as const;
      }

      if (targetGlosa.status !== nextGlosaStatus) {
        const updatedGlosas = glosas.map(g => {
          if (g.id === editedRecurso.glosaId) {
            return { ...g, status: nextGlosaStatus };
          }
          return g;
        });
        setGlosas(updatedGlosas);
        saveGlosas(updatedGlosas);
      }
    }

    // DISPUTE / RECURSO STATUS CHANGE NOTIFICATION
    if (originalRec && editedRecurso.status !== originalRec.status) {
      const pName = targetGlosa ? targetGlosa.paciente : 'Prestador';
      const gGuia = targetGlosa ? `(Protocolo de origem ${targetGlosa.numeroGuia})` : '';

      let text = '';
      let nType: 'status_change' | 'success' | 'alert' = 'status_change';
      let title = '';

      if (editedRecurso.status === 'Em análise') {
        title = '🔍 Recurso em Auditoria Médica';
        text = `A operadora alterou o status do recurso do prestador ${pName} ${gGuia} para "Em análise". É provável que tenhamos retorno breve.`;
        nType = 'status_change';
      } else if (editedRecurso.status === 'Deferido') {
        title = '✅ Recurso Deferido (Approved)';
        text = `Vitória! O recurso do prestador ${pName} ${gGuia} foi completamente DEFERIDO pela operadora técnica. O valor retido de R$ ${targetGlosa?.valorGlosado || ''} será estornado.`;
        nType = 'success';
      } else if (editedRecurso.status === 'Indeferido') {
        title = '❌ Recurso Indeferido (Denied)';
        text = `A operadora INDEFERIU (negou) o recurso para o prestador ${pName} ${gGuia}. Verifique a justificativa técnica anexada.`;
        nType = 'alert';
      } else {
        title = '🔄 Recurso Aguardando Auditoria';
        text = `O recurso do prestador ${pName} ${gGuia} retornou ao status de aguardando deliberação da mesa faturadora.`;
        nType = 'status_change';
      }

      addNotification(title, text, nType, editedRecurso.glosaId, editedRecurso.id);
    }

    showBanner(`Acompanhamento de recurso atualizado!`);
  };

  const handleDeleteRecurso = (id: number) => {
    const targetRec = recursos.find(r => r.id === id);
    const updatedRecursos = recursos.filter(r => r.id !== id);
    setRecursos(updatedRecursos);
    saveRecursos(updatedRecursos);

    // Return the associated Glosa status to "Aberta" as its resource was deleted
    if (targetRec) {
      const targetGlosa = glosas.find(g => g.id === targetRec.glosaId);
      if (targetGlosa && targetGlosa.status === 'Em recurso') {
        const updatedGlosas = glosas.map(g => {
          if (g.id === targetRec.glosaId) {
            return { ...g, status: 'Aberta' as const };
          }
          return g;
        });
        setGlosas(updatedGlosas);
        saveGlosas(updatedGlosas);
      }
    }

    showBanner(`Recurso excluído. A glosa retornou para o status "Aberta".`);
  };

  // Interlinks
  const handleInitiateRecursoOnGlosa = (glosaId: number) => {
    setFocusedGlosaId(glosaId);
    setActiveTab('recursos');
  };

  const handleViewRecursoOnGlosa = (glosaId: number) => {
    setFocusedGlosaId(glosaId);
    setActiveTab('recursos');
  };

  const handleClearFocusedGlosa = () => {
    setFocusedGlosaId(null);
  };

  // ==================== Simulation & Push Notification Engine ====================
  const formatTimeAgo = (isoStr: string) => {
    try {
      const diffMs = Date.now() - new Date(isoStr).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Agora mesmo';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `há ${diffMins} min`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `há ${diffHrs} h`;
      return new Date(isoStr).toLocaleDateString('pt-BR');
    } catch (e) {
      return '';
    }
  };

  const simulateStatusChange = () => {
    setSimulationLoading('Conectando ao Webhook da Operadora...');
    setTimeout(() => {
      setSimulationLoading('Processando alteração técnica...');
      setTimeout(() => {
        setSimulationLoading(null);
        
        // Randomly pick a provider and outcomes
        const candidates = [
          { glosaId: 2, name: 'Hospital Mater Dei S/A', guias: '2283011', valor: 680, recId: 2 },
          { glosaId: 4, name: 'Clínica Oftalmológica Olho Clínico', guias: '1092837', valor: 320, recId: 3 }
        ];
        
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        const isApproved = Math.random() > 0.4; // 60% chance of being approved

        const updatedRecursos = recursos.map(r => {
          if (r.glosaId === chosen.glosaId) {
            return {
              ...r,
              status: isApproved ? ('Deferido' as const) : ('Indeferido' as const),
              retornoConvenio: isApproved 
                ? 'Recurso validado via lote de auditoria eletrônica.' 
                : 'Justificativa rejeitada pela auditoria clínica. Exige cópia física do diário de enfermagem.'
            };
          }
          return r;
        });

        const updatedGlosas = glosas.map(g => {
          if (g.id === chosen.glosaId) {
            return { ...g, status: 'Finalizada' as const };
          }
          return g;
        });

        setRecursos(updatedRecursos);
        saveRecursos(updatedRecursos);
        setGlosas(updatedGlosas);
        saveGlosas(updatedGlosas);

        if (isApproved) {
          addNotification(
            '✅ Recurso Deferido (Approved)',
            `O recurso para o Protocolo de origem ${chosen.guias} (${chosen.name}) foi atualizado para DEFERIDO. R$ ${chosen.valor.toFixed(2)} retornam à conta da clínica.`,
            'success',
            chosen.glosaId,
            chosen.recId
          );
        } else {
          addNotification(
            '❌ Recurso Indeferido (Denied)',
            `A operadora indeferiu (negou) o recurso para o Protocolo de origem ${chosen.guias} (${chosen.name}). Clique para ver novos termos.`,
            'alert',
            chosen.glosaId,
            chosen.recId
          );
        }
      }, 1200);
    }, 1000);
  };

  const simulateAssignment = () => {
    setSimulationLoading('Injetando nova glosa em fila...');
    setTimeout(() => {
      setSimulationLoading('Associando auditor disponível...');
      setTimeout(() => {
        setSimulationLoading(null);

        const patientPool = [
          { name: 'Dr. Geraldo Montenegro - Neurologia', motivo: 'Sessão dupla de oxigenioterapia hiperbárica sem parecer prévio', valor: 1450.00 },
          { name: 'Clínica de Fisioterapia Santa Marta', motivo: 'Uso de agulha descartável Huber nº 20 fora da tabela pactuada', valor: 125.50 },
          { name: 'CardioLife Serviços Médicos Ltda', motivo: 'Ausência de carimbo legível do cirurgião assistente no termo de consentimento', valor: 2100.00 }
        ];
        
        const match = patientPool[Math.floor(Math.random() * patientPool.length)];
        const nextId = glosas.length > 0 ? Math.max(...glosas.map(g => g.id)) + 1 : 1;
        const generatedGuia = `${Math.floor(Math.random() * 8000000) + 1000000}`;

        const newMockGlosa: Glosa = {
          id: nextId,
          planoId: 1, // Unimed Nacional
          paciente: match.name,
          numeroGuia: generatedGuia,
          motivoGlosa: match.motivo,
          valorGlosado: match.valor,
          dataGlosa: new Date().toISOString().split('T')[0],
          status: 'Aberta',
          responsavel: 'Fábio Cruz'
        };

        const updated = [...glosas, newMockGlosa];
        setGlosas(updated);
        saveGlosas(updated);

        addNotification(
          '📌 Nova Glosa Atribuída a Você',
          `Novo conflito de faturamento do prestador ${match.name} (Protocolo de origem ${generatedGuia}, R$ ${match.valor.toFixed(2)}) foi distribuído a seu painel.`,
          'assignment',
          nextId
        );
      }, 1000);
    }, 1000);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
    showBanner('Todas as notificações marcadas como lidas.');
  };

  const handleClearNotifications = () => {
    if (confirm('Deseja realmente apagar todo o log histórico de alertas?')) {
      setNotifications([]);
      saveNotifications([]);
      setToasts([]);
      showBanner('Log de notificações limpo.');
    }
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    // Mark specifically as read
    const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveNotifications(updated);

    if (notif.glosaId) {
      // Find out if we have an active resource for it
      const hasRec = recursos.some(r => r.glosaId === notif.glosaId);
      if (hasRec) {
        setFocusedGlosaId(notif.glosaId);
        setActiveTab('recursos');
      } else {
        setFocusedGlosaId(null);
        setActiveTab('glosas');
      }
    }
    setIsNotificationDrawerOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Dynamic top message banner */}
      {bannerMessage && (
        <div className="bg-teal-800 text-white py-2.5 px-4 text-xs font-mono flex items-center justify-between shadow-md sticky top-0 z-50 animate-fade-in print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 block animate-ping"></span>
            <span>{bannerMessage}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-teal-350 hover:text-white ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Structural Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto md:p-6 lg:p-8 gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-4 print:hidden md:sticky md:top-6 self-start">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
            {/* System Title Branding */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderOpenDot className="w-6 h-6 text-teal-700" />
                <span className="font-sans font-semibold text-slate-900 tracking-tight text-sm leading-none uppercase">
                  CRMED RECURSO DE GLOSA
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 font-medium">RECURSOS & CONVÊNIOS</p>
            </div>

            {/* Current Session Auditor Badge */}
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-8 h-8 rounded-full bg-teal-850 border-2 border-slate-100 font-bold text-white text-xs flex items-center justify-center shrink-0 shadow-inner">
                  FC
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="Disponível para Análise"></span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-slate-800 leading-tight">Fábio Cruz</h4>
                  <p className="text-[9px] font-mono text-slate-450 truncate">fabiomscruz1983@gmail.com</p>
                </div>
              </div>
              
              {/* Notification toggle button */}
              <button
                onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
                className="relative p-2 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-100 hover:border-teal-300 transition-all shadow-3xs group cursor-pointer focus:outline-none shrink-0"
                title="Histórico de Notificações"
              >
                {unreadCount > 0 ? (
                  <>
                    <BellRing className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-2xs">
                      {unreadCount}
                    </span>
                  </>
                ) : (
                  <Bell className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
                )}
              </button>
            </div>

            {/* Menu List */}
            <nav className="space-y-1.5 font-sans" aria-label="Menu Principal">
              {/* Dashboard */}
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  handleClearFocusedGlosa();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                Painel Dashboard
              </button>

              {/* Convenios */}
              <button
                onClick={() => {
                  setActiveTab('planos');
                  handleClearFocusedGlosa();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
                  activeTab === 'planos'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users2 className="w-4 h-4 shrink-0" />
                Convênios / Planos
              </button>

              {/* Glosas */}
              <button
                onClick={() => {
                  setActiveTab('glosas');
                  handleClearFocusedGlosa();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
                  activeTab === 'glosas'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Glosas Auditadas
              </button>

              {/* Recursos */}
              <button
                onClick={() => {
                  setActiveTab('recursos');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
                  activeTab === 'recursos'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FilePlus2 className="w-4 h-4 shrink-0" />
                Defesa / Recursos
              </button>

              {/* Relatorios */}
              <button
                onClick={() => {
                  setActiveTab('relatorios');
                  handleClearFocusedGlosa();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
                  activeTab === 'relatorios'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                Relatórios Financeiros
              </button>
            </nav>

            {/* Utility Divider / System info */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 transition-all rounded-lg cursor-pointer w-full text-center"
                title="Recarregar banco de dados com dados originais"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                Zerar / Reiniciar Dados
              </button>
            </div>
          </div>
        </aside>

        {/* Actionable workspace container */}
        <main className="flex-1 min-w-0 bg-transparent py-4 px-4 md:py-0 md:px-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              planos={planos}
              glosas={glosas}
              recursos={recursos}
              onNavigateToGlosas={() => setActiveTab('glosas')}
              onNavigateToRecursos={() => setActiveTab('recursos')}
              onNavigateToPlanos={() => setActiveTab('planos')}
            />
          )}

          {activeTab === 'planos' && (
            <PlanosView
              planos={planos}
              onAddPlano={handleAddPlano}
              onEditPlano={handleEditPlano}
              onDeletePlano={handleDeletePlano}
            />
          )}

          {activeTab === 'glosas' && (
            <GlosasView
              glosas={glosas}
              planos={planos}
              recursos={recursos}
              onAddGlosa={handleAddGlosa}
              onEditGlosa={handleEditGlosa}
              onDeleteGlosa={handleDeleteGlosa}
              onInitiateRecurso={handleInitiateRecursoOnGlosa}
              onViewRecurso={handleViewRecursoOnGlosa}
            />
          )}

          {activeTab === 'recursos' && (
            <RecursosView
              recursos={recursos}
              glosas={glosas}
              focusedGlosaId={focusedGlosaId}
              onClearFocusedGlosa={handleClearFocusedGlosa}
              onAddRecurso={handleAddRecurso}
              onEditRecurso={handleEditRecurso}
              onDeleteRecurso={handleDeleteRecurso}
            />
          )}

          {activeTab === 'relatorios' && (
            <RelatoriosView planos={planos} glosas={glosas} recursos={recursos} />
          )}
        </main>
      </div>
      <Analytics />
    </div>
  );
}
