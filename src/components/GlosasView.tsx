/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Glosa, Plano, Recurso, StatusGlosa } from '../types';
import { PlusCircle, Search, Edit3, Trash2, CheckCircle, FilePlus2, Eye, X, HelpCircle, Calendar, DollarSign, User, ClipboardList, Shield } from 'lucide-react';

interface GlosasViewProps {
  glosas: Glosa[];
  planos: Plano[];
  recursos: Recurso[];
  onAddGlosa: (glosa: Omit<Glosa, 'id'>) => void;
  onEditGlosa: (glosa: Glosa) => void;
  onDeleteGlosa: (id: number) => void;
  onInitiateRecurso: (glosaId: number) => void;
  onViewRecurso: (glosaId: number) => void;
}

export default function GlosasView({
  glosas,
  planos,
  recursos,
  onAddGlosa,
  onEditGlosa,
  onDeleteGlosa,
  onInitiateRecurso,
  onViewRecurso,
}: GlosasViewProps) {
  // Form fields
  const [paciente, setPaciente] = useState('');
  const [numeroGuia, setNumeroGuia] = useState('');
  const [planoId, setPlanoId] = useState<number>(planos[0]?.id || 0);
  const [motivoGlosa, setMotivoGlosa] = useState('');
  const [valorGlosado, setValorGlosado] = useState('');
  const [dataGlosa, setDataGlosa] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<StatusGlosa>('Aberta');
  const [responsavel, setResponsavel] = useState('Fábio Cruz');
  const [protocoloRecurso, setProtocoloRecurso] = useState('');
  const [prazoLimite, setPrazoLimite] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    return nextMonth.toISOString().split('T')[0];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Edit glosa state
  const [editingGlosa, setEditingGlosa] = useState<Glosa | null>(null);

  // Sync state when planos changes or a plano is available
  React.useEffect(() => {
    if (planos.length > 0 && !planoId) {
      setPlanoId(planos[0].id);
    }
  }, [planos, planoId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente.trim() || !numeroGuia.trim() || !motivoGlosa.trim() || !valorGlosado || !planoId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const valorParsed = parseFloat(valorGlosado);
    if (isNaN(valorParsed) || valorParsed <= 0) {
      alert('Adicione um valor glosado válido.');
      return;
    }

    onAddGlosa({
      planoId: Number(planoId),
      paciente: paciente.trim(),
      numeroGuia: numeroGuia.trim(),
      motivoGlosa: motivoGlosa.trim(),
      valorGlosado: valorParsed,
      dataGlosa,
      status, // 'Aberta', 'Em recurso', 'Finalizada'
      responsavel,
      protocoloRecurso: protocoloRecurso.trim(),
      prazoLimite,
    });

    // Reset
    setPaciente('');
    setNumeroGuia('');
    setMotivoGlosa('');
    setValorGlosado('');
    setDataGlosa(new Date().toISOString().split('T')[0]);
    setStatus('Aberta');
    setResponsavel('Fábio Cruz');
    setProtocoloRecurso('');
    setPrazoLimite(() => {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      return nextMonth.toISOString().split('T')[0];
    });
    setIsAdding(false);
  };

  const handleOpenEdit = (glosa: Glosa) => {
    setEditingGlosa(glosa);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGlosa) return;
    if (!editingGlosa.paciente.trim() || !editingGlosa.numeroGuia.trim() || !editingGlosa.motivoGlosa.trim() || !editingGlosa.valorGlosado) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    onEditGlosa(editingGlosa);
    setEditingGlosa(null);
  };

  // Filter & Search Logic
  const filteredGlosas = glosas.filter((glosa) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      glosa.paciente.toLowerCase().includes(searchLower) ||
      glosa.numeroGuia.toLowerCase().includes(searchLower) ||
      glosa.motivoGlosa.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = statusFilter === 'todos' || glosa.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPlanoNome = (id: number) => {
    return planos.find((p) => p.id === id)?.nome || 'Sem Convênio';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const hasRecurso = (glosaId: number) => {
    return recursos.some((r) => r.glosaId === glosaId);
  };

  const getRecursoStatus = (glosaId: number) => {
    const rec = recursos.find((r) => r.glosaId === glosaId);
    return rec ? rec.status : null;
  };

  const getPrazoCountdown = (glosa: Glosa) => {
    if (glosa.status === 'Finalizada') {
      return (
        <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-md text-[10px] font-sans font-medium">
          ⏱️ Prazo Finalizado (Conciliado)
        </span>
      );
    }
    if (!glosa.prazoLimite) {
      return null;
    }
    
    try {
      const today = new Date('2026-05-25'); // Anchored mock database calendar clock date
      const limit = new Date(glosa.prazoLimite);
      today.setHours(0,0,0,0);
      limit.setHours(0,0,0,0);
      
      const diffTime = limit.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 5) {
        return (
          <span className="bg-teal-50 border border-teal-200 text-teal-800 px-2.5 py-0.5 rounded-md text-[10px] font-sans font-bold shadow-3xs flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ⏱️ {diffDays} dias para recorrer
          </span>
        );
      } else if (diffDays > 0) {
        return (
          <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-0.5 rounded-md text-[10px] font-sans font-extrabold shadow-3xs flex items-center gap-1 animate-pulse">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            ⏱️ {diffDays} dias restantes (Urgente!)
          </span>
        );
      } else if (diffDays === 0) {
        return (
          <span className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-0.5 rounded-md text-[10px] font-sans font-black shadow-2xs flex items-center gap-1 animate-ping">
            ⏱️ EXPIRA HOJE!
          </span>
        );
      } else {
        return (
          <span className="bg-red-50 border border-red-250 text-red-650 px-2.5 py-0.5 rounded-md text-[10px] font-sans font-medium flex items-center gap-1">
            ⚠️ Vencido há {Math.abs(diffDays)} dias
          </span>
        );
      }
    } catch(e) {
      return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section with Stats in mini header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Auditório de Glosas Médicas
          </h1>
          <p className="text-xs text-slate-400">
            Gerencie faturamentos glosados, filtre pendências e despache justificativas clínicas.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 font-sans font-medium text-white px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
        >
          {isAdding ? (
            <>
              <X className="w-4 h-4" /> Cancelar Lançamento
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" /> Registrar Nova Glosa
            </>
          )}
        </button>
      </div>

      {/* Registation form (Nova Glosa) */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-5 border border-teal-500/20 shadow-md space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" /> Ficha de Registro de Inconsistência
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Tabela: glosas</span>
          </div>

          {planos.length === 0 ? (
            <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200">
              Você precisa cadastrar um convênio antes de adicionar uma glosa acadêmica ou corporativa.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prestador de Serviço *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex. Hospital Geral S/A ou Dr. Renato Silva"
                    value={paciente}
                    onChange={(e) => setPaciente(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-9 p-2.5 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Protocolo de origem *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. 992813-A (Origem da Guia)"
                  value={numeroGuia}
                  onChange={(e) => setNumeroGuia(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Protocolo do recurso</label>
                <input
                  type="text"
                  placeholder="Ex. RECURSO-2026-0099"
                  value={protocoloRecurso}
                  onChange={(e) => setProtocoloRecurso(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Convênios cadastrados *</label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <select
                    value={planoId}
                    onChange={(e) => setPlanoId(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-9 p-2.5 outline-none focus:border-teal-500 transition-colors bg-white h-[38px]"
                  >
                    {planos.map((plano) => (
                      <option key={plano.id} value={plano.id}>
                        {plano.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data da Retenção (Glosa) *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={dataGlosa}
                    onChange={(e) => setDataGlosa(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-9 p-2.5 outline-none focus:border-teal-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data Limite para Recurso *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={prazoLimite}
                    onChange={(e) => setPrazoLimite(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-9 p-2.5 outline-none focus:border-teal-500 transition-colors font-mono bg-teal-50/25 border-teal-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Glosado (Retido) *</label>
                <div className="relative">
                  <span className="text-xs font-mono font-bold absolute left-3 top-3 text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    placeholder="0.00"
                    value={valorGlosado}
                    onChange={(e) => setValorGlosado(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-9 p-2.5 outline-none focus:border-teal-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Interno Recomendado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusGlosa)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors bg-white font-medium"
                >
                  <option value="Aberta">Aberta (Sem recurso iniciado)</option>
                  <option value="Em recurso">Em recurso</option>
                  <option value="Finalizada">Finalizada / Conciliada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável / Auditor</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <select
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-9 p-2.5 outline-none focus:border-teal-500 transition-colors bg-white h-[38px] font-medium text-slate-700"
                  >
                    <option value="Fábio Cruz">Fábio Cruz (Você)</option>
                    <option value="Dra. Ana Paula">Dra. Ana Paula</option>
                    <option value="Dr. Renato Alves">Dr. Renato Alves</option>
                    <option value="Guilherme Santos">Guilherme Santos</option>
                    <option value="Sem Atribuição">Sem Atribuição (Pendente)</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo do Bloqueio ou Glosa (Descrição Técnica) *</label>
                <textarea
                  required
                  placeholder="Justifique o motivo apontado pela auditoria do plano..."
                  rows={3}
                  value={motivoGlosa}
                  onChange={(e) => setMotivoGlosa(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={planos.length === 0}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Salvar Glosa
            </button>
          </div>
        </form>
      )}

      {/* Edit Form Modal (Lightbox layout to ensure pristine edits) */}
      {editingGlosa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xl max-w-lg w-full space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold font-sans text-slate-900">
                Editar Glosa: Guia #{editingGlosa.numeroGuia}
              </h3>
              <button
                type="button"
                onClick={() => setEditingGlosa(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Prestador de Serviço</label>
                <input
                  type="text"
                  required
                  value={editingGlosa.paciente}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, paciente: e.target.value })}
                  className="w-full border border-slate-250 rounded p-2 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Protocolo de origem</label>
                <input
                  type="text"
                  required
                  value={editingGlosa.numeroGuia}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, numeroGuia: e.target.value })}
                  className="w-full border border-slate-250 rounded p-2 focus:border-teal-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Protocolo do recurso</label>
                <input
                  type="text"
                  placeholder="Ex. RECURSO-2026-0099"
                  value={editingGlosa.protocoloRecurso || ''}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, protocoloRecurso: e.target.value })}
                  className="w-full border border-slate-250 rounded p-2 focus:border-teal-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Convênio</label>
                <select
                  value={editingGlosa.planoId}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, planoId: Number(e.target.value) })}
                  className="w-full border border-slate-250 rounded p-2 bg-white focus:border-teal-500 outline-none"
                >
                  {planos.map((plano) => (
                    <option key={plano.id} value={plano.id}>
                      {plano.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Data da Retenção</label>
                <input
                  type="date"
                  required
                  value={editingGlosa.dataGlosa}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, dataGlosa: e.target.value })}
                  className="w-full border border-slate-250 rounded p-2 focus:border-teal-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Data Limite para Recurso</label>
                <input
                  type="date"
                  required
                  value={editingGlosa.prazoLimite || ''}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, prazoLimite: e.target.value })}
                  className="w-full border border-slate-250 rounded p-2 focus:border-teal-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Valor Glosado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingGlosa.valorGlosado}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, valorGlosado: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-250 rounded p-2 focus:border-teal-500 outline-none font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Status Interno</label>
                <select
                  value={editingGlosa.status}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, status: e.target.value as StatusGlosa })}
                  className="w-full border border-slate-250 rounded p-2 bg-white focus:border-teal-500 outline-none"
                >
                  <option value="Aberta">Aberta (Sem recurso iniciado)</option>
                  <option value="Em recurso">Em recurso</option>
                  <option value="Finalizada">Finalizada / Conciliada</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Auditor / Responsável Atribuído</label>
                <select
                  value={editingGlosa.responsavel || 'Sem Atribuição'}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, responsavel: e.target.value })}
                  className="w-full border border-slate-250 rounded p-2 bg-white focus:border-teal-500 outline-none font-medium"
                >
                  <option value="Fábio Cruz">Fábio Cruz (Você)</option>
                  <option value="Dra. Ana Paula">Dra. Ana Paula</option>
                  <option value="Dr. Renato Alves">Dr. Renato Alves</option>
                  <option value="Guilherme Santos">Guilherme Santos</option>
                  <option value="Sem Atribuição">Sem Atribuição (Pendente)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Motivo do Bloqueio</label>
                <textarea
                  rows={3}
                  required
                  value={editingGlosa.motivoGlosa}
                  onChange={(e) => setEditingGlosa({ ...editingGlosa, motivoGlosa: e.target.value })}
                  className="w-full border border-slate-250 rounded p-2 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingGlosa(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Atualizar Glosa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Box */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por prestador, protocolo de origem ou motivo da glosa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 p-3 outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1">
            Filtrar:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none font-medium text-slate-700"
          >
            <option value="todos">Todos os Status</option>
            <option value="Aberta">Glosas Abertas</option>
            <option value="Em recurso">Em Recurso</option>
            <option value="Finalizada">Finalizadas</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {filteredGlosas.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200/80 text-slate-400 font-mono text-xs">
            Nenhuma guia médica encontrada para os critérios informados.
          </div>
        ) : (
          filteredGlosas.map((glosa) => {
            const resourceExists = hasRecurso(glosa.id);
            const rStatus = getRecursoStatus(glosa.id);

            return (
              <div
                key={glosa.id}
                className={`bg-white rounded-xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  glosa.status === 'Finalizada' ? 'border-teal-200/50 bg-teal-50/10' : 'border-slate-200'
                }`}
              >
                {/* Details column */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-50 border border-blue-105 text-blue-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase" title="Protocolo de Origem">
                      Prot. Origem: #{glosa.numeroGuia}
                    </span>
                    {glosa.protocoloRecurso && (
                      <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase animate-fade-in animate-pulse" title="Protocolo do Recurso">
                        Prot. Recurso: {glosa.protocoloRecurso}
                      </span>
                    )}
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                      {getPlanoNome(glosa.planoId)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Lançado: {glosa.dataGlosa}
                    </span>
                    
                    {/* Contador de prazo para recurso */}
                    {getPrazoCountdown(glosa)}

                    {/* Badge status */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        glosa.status === 'Aberta'
                          ? 'bg-red-50 text-red-700 border border-red-150'
                          : glosa.status === 'Em recurso'
                          ? 'bg-amber-50 text-amber-700 border border-amber-150'
                          : 'bg-teal-50 text-teal-700 border border-teal-150'
                      }`}
                    >
                      {glosa.status}
                    </span>

                    {/* Atribuído Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border ${
                      glosa.responsavel === 'Fábio Cruz'
                        ? 'bg-teal-50 text-teal-800 border-teal-200/60 font-semibold text-[10px]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 text-[10px]'
                    }`}>
                      <User className="w-2.5 h-2.5" />
                      Auditor: {glosa.responsavel || 'Sem Atribuição'}
                      {glosa.responsavel === 'Fábio Cruz' && ' (Você)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold font-mono text-teal-700 uppercase tracking-widest block mb-1">Prestador de Serviço</span>
                    <h3 className="text-sm font-sans font-bold text-slate-800">
                      {glosa.paciente}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">Motivo:</span> {glosa.motivoGlosa}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Valor Glosado:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(glosa.valorGlosado)}</span>
                    </div>

                    {resourceExists && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-slate-450 text-[11px]">Recurso:</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            rStatus === 'Deferido'
                              ? 'bg-teal-600 text-white'
                              : rStatus === 'Indeferido'
                              ? 'bg-red-600 text-white'
                              : rStatus === 'Em análise'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-400 text-white'
                          }`}
                        >
                          {rStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations column */}
                <div className="flex flex-row md:flex-col gap-2 items-stretch justify-end min-w-[150px] border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  {/* Dynamic Action Button based on resource state */}
                  {!resourceExists ? (
                    <button
                      onClick={() => onInitiateRecurso(glosa.id)}
                      className="flex items-center justify-center gap-1 py-2 px-3 bg-teal-800 hover:bg-teal-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors w-full"
                    >
                      <FilePlus2 className="w-3.5 h-3.5" /> Criar Recurso
                    </button>
                  ) : (
                    <button
                      onClick={() => onViewRecurso(glosa.id)}
                      className="flex items-center justify-center gap-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium cursor-pointer transition-colors w-full border border-indigo-200"
                    >
                      <Eye className="w-3.5 h-3.5" /> Acompanhar Recurso
                    </button>
                  )}

                  <div className="flex gap-1.5 w-full">
                    <button
                      onClick={() => handleOpenEdit(glosa)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                      title="Editar Glosa"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Deseja realmente excluir este registro de glosa? O recurso associado (se houver) também será removido da base.')) {
                          onDeleteGlosa(glosa.id);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                      title="Excluir Glosa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
