/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Recurso, Glosa, StatusRecurso } from '../types';
import { FileText, Calendar, Save, Trash2, Edit3, ArrowRightLeft, Upload, FileCheck, CheckCircle2, ChevronRight, HelpCircle, X, ShieldAlert } from 'lucide-react';

interface RecursosViewProps {
  recursos: Recurso[];
  glosas: Glosa[];
  focusedGlosaId: number | null;
  onClearFocusedGlosa: () => void;
  onAddRecurso: (recurso: Omit<Recurso, 'id'>) => void;
  onEditRecurso: (recurso: Recurso) => void;
  onDeleteRecurso: (id: number) => void;
}

export default function RecursosView({
  recursos,
  glosas,
  focusedGlosaId,
  onClearFocusedGlosa,
  onAddRecurso,
  onEditRecurso,
  onDeleteRecurso,
}: RecursosViewProps) {
  // We can choose which glosa we are creating/editing for
  const [selectedGlosaId, setSelectedGlosaId] = useState<number>(focusedGlosaId || 0);
  const [textoRecurso, setTextoRecurso] = useState('');
  const [dataEnvio, setDataEnvio] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<StatusRecurso>('Aguardando');
  const [retornoConvenio, setRetornoConvenio] = useState('');

  // PDF upload simulation state
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter for selecting specific resources
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Currently editing resource
  const [editingRecurso, setEditingRecurso] = useState<Recurso | null>(null);

  // Sync state if focusedGlosaId triggers
  React.useEffect(() => {
    if (focusedGlosaId) {
      setSelectedGlosaId(focusedGlosaId);
      // If we are looking at focused, reset attachment or initial fields too
      const existing = recursos.find(r => r.glosaId === focusedGlosaId);
      if (existing) {
        // Edit existing instead
        setEditingRecurso(existing);
      } else {
        // Blank new one
        setTextoRecurso('');
        setRetornoConvenio('');
        setStatus('Aguardando');
        setAttachedFile(null);
      }
    }
  }, [focusedGlosaId, recursos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setAttachedFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        });
      } else {
        alert('Por favor, anexe apenas arquivos no formato PDF para auditoria.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setAttachedFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        });
      } else {
        alert('Por favor, anexe apenas arquivos no formato PDF para auditoria.');
      }
    }
  };

  const handleCreateRecurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGlosaId) {
      alert('Selecione uma glosa para direcionar seu recurso.');
      return;
    }
    if (!textoRecurso.trim()) {
      alert('Por favor, informe a justificativa ou texto do recurso.');
      return;
    }

    onAddRecurso({
      glosaId: Number(selectedGlosaId),
      textoRecurso: textoRecurso.trim(),
      dataEnvio,
      status,
      retornoConvenio: retornoConvenio.trim(),
      anexoNome: attachedFile?.name || undefined,
      anexoTamanho: attachedFile?.size || undefined,
    });

    // Reset Form
    setTextoRecurso('');
    setRetornoConvenio('');
    setStatus('Aguardando');
    setAttachedFile(null);
    onClearFocusedGlosa();
    setSelectedGlosaId(0);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecurso) return;
    if (!editingRecurso.textoRecurso.trim()) {
      alert('Por favor, informe a justificativa técnica.');
      return;
    }
    onEditRecurso(editingRecurso);
    setEditingRecurso(null);
    onClearFocusedGlosa();
  };

  const getGlosaInfo = (glosaId: number) => {
    return glosas.find((g) => g.id === glosaId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filter out glosas that already have resources (except the one we might be creating for)
  const availableGlosas = glosas.filter((glosa) => {
    const alreadyRecursed = recursos.some((r) => r.glosaId === glosa.id);
    return !alreadyRecursed || glosa.id === focusedGlosaId;
  });

  // Filtered Recursos list
  const filteredRecursos = recursos.filter((r) => {
    if (statusFilter === 'todos') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
          Formulário de Recursos
        </h1>
        <p className="text-xs text-slate-400">
          Elabore defesas técnicas, anexe provas documentais (PDF) e registre o termo concessivo do convênio.
        </p>
      </div>

      {/* Editor/Creator section */}
      {(focusedGlosaId || selectedGlosaId > 0 || editingRecurso) && (
        <div className="bg-white rounded-xl p-5 border border-teal-500/20 shadow-md">
          {editingRecurso ? (
            // Edit Form
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" /> Atualizar Recurso de Glosa (#ID: {editingRecurso.id})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRecurso(null);
                    onClearFocusedGlosa();
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Fechar Edição
                </button>
              </div>

              {/* Informative alert about target Glosa */}
              {(() => {
                const targetGlosa = getGlosaInfo(editingRecurso.glosaId);
                return targetGlosa ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-slate-500 font-mono uppercase tracking-wider text-[10px]">Prestador & Protocolo de origem</span>
                    <div>
                      <span className="font-bold text-slate-800">{targetGlosa.paciente}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span>Protocolo de origem: <b className="font-mono text-blue-700">{targetGlosa.numeroGuia}</b></span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span>Valor Bloqueado: <b className="text-red-600">{formatCurrency(targetGlosa.valorGlosado)}</b></span>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Envio do Ofício</label>
                  <input
                    type="date"
                    required
                    value={editingRecurso.dataEnvio}
                    onChange={(e) => setEditingRecurso({ ...editingRecurso, dataEnvio: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status de Resposta da Operadora</label>
                  <select
                    value={editingRecurso.status}
                    onChange={(e) => setEditingRecurso({ ...editingRecurso, status: e.target.value as StatusRecurso })}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="Aguardando">Aguardando Envio</option>
                    <option value="Em análise">Em análise técnica</option>
                    <option value="Deferido">Deferido (Recuperado)</option>
                    <option value="Indeferido">Indeferido (Prejuízo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 block">Anexo Armazenado</label>
                  <div className="flex items-center gap-2 p-2.5 border border-dashed border-slate-200 rounded-lg bg-slate-50 text-[11px] font-mono text-slate-600 h-[38px] truncate">
                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{editingRecurso.anexoNome || 'Sem PDF anexado'}</span>
                    {editingRecurso.anexoNome && (
                      <button
                        type="button"
                        onClick={() => setEditingRecurso({ ...editingRecurso, anexoNome: undefined, anexoTamanho: undefined })}
                        className="text-red-500 hover:bg-slate-200 p-0.5 rounded ml-auto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Texto Justificativa do Recurso *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Articule os argumentos científicos, cite CID ou anexos..."
                    value={editingRecurso.textoRecurso}
                    onChange={(e) => setEditingRecurso({ ...editingRecurso, textoRecurso: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parecer de Retorno do Convênio (Termos oficiais se houver)</label>
                  <textarea
                    rows={2}
                    placeholder="Cole aqui o e-mail ou deliberação enviado pelo auditor do plano..."
                    value={editingRecurso.retornoConvenio}
                    onChange={(e) => setEditingRecurso({ ...editingRecurso, retornoConvenio: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRecurso(null);
                    onClearFocusedGlosa();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancelar Edição
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          ) : (
            // Create Form
            <form onSubmit={handleCreateRecurso} className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Preparar Justificativa Recursiva
                </h3>
                {(focusedGlosaId || selectedGlosaId > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearFocusedGlosa();
                      setSelectedGlosaId(0);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-0.5"
                  >
                    <X className="w-3.5 h-3.5" /> Fechar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione um Protocolo Pendente *</label>
                  <select
                    value={selectedGlosaId}
                    onChange={(e) => setSelectedGlosaId(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors h-[38px]"
                    required
                  >
                    <option value="">Selecione de origem...</option>
                    {availableGlosas.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.paciente} (Origem: #{g.numeroGuia} - {formatCurrency(g.valorGlosado)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Postagem do Recurso</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={dataEnvio}
                      onChange={(e) => setDataEnvio(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg pl-9 p-2.5 outline-none focus:border-teal-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status do Pedido de Revisão</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusRecurso)}
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="Aguardando">Aguardando Envio</option>
                    <option value="Em análise">Em análise médica</option>
                    <option value="Deferido">Deferido</option>
                    <option value="Indeferido">Indeferido</option>
                  </select>
                </div>

                {/* Technical text of resource */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Justificativa Recursiva (Ofício Clínico) *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Excelentíssimo Departamento de Auditoria, vimos requerer reanálise fundamentada no prontuário..."
                    value={textoRecurso}
                    onChange={(e) => setTextoRecurso(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                {/* Retorno do convênio */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retorno Oficial do Convênio (Opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="Se houver resposta prévia, anote o mérito clínico aqui..."
                    value={retornoConvenio}
                    onChange={(e) => setRetornoConvenio(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Drag and drop file upload simulated beautifully */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Provas Documentais (Apenas arquivos .PDF)
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                    isDragging
                      ? 'border-teal-500 bg-teal-50/20'
                      : attachedFile
                      ? 'border-teal-300 bg-emerald-50/10'
                      : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {attachedFile ? (
                    <>
                      <FileCheck className="w-8 h-8 text-emerald-600 animate-bounce" />
                      <div className="text-xs font-bold text-slate-700">{attachedFile.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Tamanho: {attachedFile.size}</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachedFile(null);
                        }}
                        className="text-[10px] text-red-500 hover:underline bg-red-50 px-2 py-0.5 rounded border border-red-100 mt-2"
                      >
                        Remover do Lote
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400" />
                      <div className="text-xs font-bold text-slate-700">Arrastar & Soltar Prontuários Clinicos (.PDF)</div>
                      <p className="text-[10px] text-slate-450">Ou clique para selecionar de pastas locais</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGlosaId(0);
                    onClearFocusedGlosa();
                    setAttachedFile(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Registrar Recurso de Ofício
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Selector view and Filter of status */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-xs font-mono font-bold text-slate-900 uppercase">Lista de Recursos Protocolados</h3>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-400 font-medium">Status do Retorno:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none font-medium text-slate-700"
          >
            <option value="todos">Todos os Recursos</option>
            <option value="Aguardando">Aguardando Envio</option>
            <option value="Em análise">Em análise</option>
            <option value="Deferido">Deferidos (Aprovados)</option>
            <option value="Indeferido">Indeferidos (Negados)</option>
          </select>
        </div>
      </div>

      {/* List of resources */}
      <div className="space-y-4">
        {filteredRecursos.length === 0 ? (
          <div className="bg-white rounded-xl p-10 border border-slate-200 text-center text-slate-400 font-mono text-xs">
            Nenhum recurso protocolado correspondente a este status no momento.
          </div>
        ) : (
          filteredRecursos.map((rec) => {
            const correspondingGlosa = getGlosaInfo(rec.glosaId);
            return (
              <div
                key={rec.id}
                className={`bg-white rounded-xl p-5 border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row gap-5 justify-between ${
                  rec.status === 'Deferido'
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : rec.status === 'Indeferido'
                    ? 'border-red-200 bg-red-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Visual Body text */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      Protocolo #{rec.id}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Postado em: {rec.dataEnvio}
                    </span>

                    {/* Badge status */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === 'Deferido'
                          ? 'bg-emerald-600 text-white'
                          : rec.status === 'Indeferido'
                          ? 'bg-red-600 text-white'
                          : rec.status === 'Em análise'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-500 text-white'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>

                  {correspondingGlosa ? (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                      <span className="font-semibold block text-slate-500 text-[10px] uppercase font-mono mb-1">Inconsistência de Origem</span>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Prestador: <b>{correspondingGlosa.paciente}</b>
                        </span>
                        <span>
                          Protocolo de origem: <b className="font-mono text-blue-700">{correspondingGlosa.numeroGuia}</b>
                        </span>
                        <span>
                          Valor Bloqueado: <b className="text-red-700">{formatCurrency(correspondingGlosa.valorGlosado)}</b>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-red-50 text-red-700 rounded text-xs">
                      Alerta: Glosa correspondente foi apagada (#FK id {rec.glosaId})
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Justificativa Técnica Enviada:
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50/30 p-3 rounded-lg border border-slate-100 leading-relaxed font-mono">
                      "{rec.textoRecurso}"
                    </p>
                  </div>

                  {rec.retornoConvenio && (
                    <div className="space-y-1 bg-teal-50/25 p-3 rounded-lg border border-teal-100">
                      <span className="text-[11px] font-bold text-teal-850 flex items-center gap-1">
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Manifestação Oficial do Convênio:
                      </span>
                      <p className="text-xs text-slate-700 italic">
                        "{rec.retornoConvenio}"
                      </p>
                    </div>
                  )}

                  {rec.anexoNome && (
                    <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded text-[10px] font-mono border border-slate-200/50 w-fit">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{rec.anexoNome}</span>
                      <span className="text-slate-400">({rec.anexoTamanho})</span>
                    </div>
                  )}
                </div>

                {/* Operations */}
                <div className="flex flex-row lg:flex-col gap-2 items-center lg:items-center justify-end min-w-[140px] border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                  <button
                    onClick={() => setEditingRecurso(rec)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-850 rounded-lg text-xs font-semibold cursor-pointer w-full transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar Parecer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Excluir este recurso de glosa?')) {
                        onDeleteRecurso(rec.id);
                      }
                    }}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
