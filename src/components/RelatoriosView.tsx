/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plano, Glosa, Recurso } from '../types';
import { FileSpreadsheet, ShieldCheck, ShieldAlert, Award, FileText, Download, Printer, Filter, Receipt } from 'lucide-react';

interface RelatoriosViewProps {
  planos: Plano[];
  glosas: Glosa[];
  recursos: Recurso[];
}

export default function RelatoriosView({ planos, glosas, recursos }: RelatoriosViewProps) {
  const [selectedPlanoId, setSelectedPlanoId] = useState<string>('todos');
  const [reportType, setReportType] = useState<'geral' | 'abertas' | 'deferidos' | 'recuperados'>('geral');

  const getPlanoNome = (id: number) => {
    return planos.find((p) => p.id === id)?.nome || 'Sem Convênio';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // 1. Filtered Glosas by selected plano
  const getFilteredGlosas = () => {
    return glosas.filter((g) => {
      if (selectedPlanoId === 'todos') return true;
      return g.planoId === Number(selectedPlanoId);
    });
  };

  const filteredGlosas = getFilteredGlosas();

  // 2. Glosas abertas (status "Aberta")
  const glosasAbertasCount = filteredGlosas.filter(g => g.status === 'Aberta').length;
  const glosasAbertasTotal = filteredGlosas.filter(g => g.status === 'Aberta').reduce((acc, curr) => acc + curr.valorGlosado, 0);

  // 3. Recursos deferidos (status "Deferido")
  const recursosDeferidos = recursos.filter((r) => {
    const glosa = glosas.find((g) => g.id === r.glosaId);
    if (selectedPlanoId !== 'todos') {
      return r.status === 'Deferido' && glosa?.planoId === Number(selectedPlanoId);
    }
    return r.status === 'Deferido';
  });

  // 4. Valores recuperados
  const totalValoresRecuperados = filteredGlosas.reduce((acc, currGlosa) => {
    const recurso = recursos.find((r) => r.glosaId === currGlosa.id);
    if (recurso && recurso.status === 'Deferido') {
      return acc + currGlosa.valorGlosado;
    }
    return acc;
  }, 0);

  // Print simulation
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Header view with controls */}
      <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
            Relatórios e Balancetes
          </h1>
          <p className="text-xs text-slate-400">
            Filtre auditorias clínicas e emita relatórios de desempenho financeiro por operadora.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between print:hidden">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <Filter className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div>
              <label className="block text-[11px] font-semibold text-slate-450 mb-1">Filtrar por Plano/Convênio</label>
              <select
                value={selectedPlanoId}
                onChange={(e) => setSelectedPlanoId(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none font-medium text-slate-700"
              >
                <option value="todos">Todos os Convênios</option>
                {planos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-450 mb-1">Tipo de Consulta Técnica</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none font-medium text-slate-700"
              >
                <option value="geral">Balancete Geral e Recuperação</option>
                <option value="abertas">Relatório de Glosas Abertas</option>
                <option value="deferidos">Relatório de Recursos Deferidos</option>
                <option value="recuperados">Demonstrativo de Valores Recuperados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Report Main Sheet Paper (Styled like a professional report ready for printing) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs relative print:border-none print:shadow-none">
        {/* Print Brand-Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <span className="font-mono text-xs text-slate-400 font-bold tracking-wider uppercase">Faturamento Hospitalar & Auditoria</span>
            <h2 className="text-xl font-bold font-sans text-slate-800 mt-1">EMISSÃO DE TERMOS E COMPLEMENTOS DE GLOSA</h2>
            <div className="text-xs text-slate-400 mt-1 space-y-0.5 font-mono">
              <p>Relatório emitido em: <b className="text-slate-700">{new Date().toLocaleString('pt-BR')}</b></p>
              <p>Foco de Operadoras: <b className="text-slate-705">{selectedPlanoId === 'todos' ? 'Todos os Planos' : getPlanoNome(Number(selectedPlanoId))}</b></p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono tracking-widest bg-slate-100 px-3 py-1 rounded text-slate-500 font-bold uppercase">
              CONFIDENCIAL
            </span>
          </div>
        </div>

        {/* Dynamic content rendering based on reportType */}

        {/* 1. GERAL */}
        {reportType === 'geral' && (
          <div className="space-y-6">
            <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4 text-indigo-700" /> Balancete Financeiro
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-mono font-bold text-slate-450 uppercase block mb-1">Glosas Ativas Retidas</span>
                <span className="text-lg font-bold text-slate-800">{formatCurrency(glosasAbertasTotal)}</span>
                <span className="text-[10px] text-slate-400 block mt-1">{glosasAbertasCount} guias abertas</span>
              </div>
              <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-100">
                <span className="text-[10px] font-mono font-bold text-teal-800 uppercase block mb-1">Montante Recuperado</span>
                <span className="text-lg font-bold text-teal-700">{formatCurrency(totalValoresRecuperados)}</span>
                <span className="text-[10px] text-teal-600 font-mono block mt-1">{recursosDeferidos.length} recursos favoráveis</span>
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <span className="text-[10px] font-mono font-bold text-indigo-805 uppercase block mb-1">Faturamento sob Recurso</span>
                <span className="text-lg font-bold text-indigo-700">
                  {formatCurrency(
                    filteredGlosas
                      .filter(g => g.status === 'Em recurso')
                      .reduce((acc, curr) => acc + curr.valorGlosado, 0)
                  )}
                </span>
                <span className="text-[10px] text-indigo-500 block mt-1">Aguardando decisão técnica</span>
              </div>
            </div>

            {/* Micro visual bars representation */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Participação de Recuperação das Auditadas</span>
              <div className="relative pt-1">
                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-slate-100">
                  {(() => {
                    const totalGlosadoF = filteredGlosas.reduce((acc, curr) => acc + curr.valorGlosado, 0);
                    const recVal = totalValoresRecuperados;
                    const openVal = glosasAbertasTotal;
                    const emRecVal = totalGlosadoF - recVal - openVal;

                    const pRec = totalGlosadoF > 0 ? (recVal / totalGlosadoF) * 100 : 0;
                    const pOpen = totalGlosadoF > 0 ? (openVal / totalGlosadoF) * 100 : 0;
                    const pEmRec = totalGlosadoF > 0 ? (emRecVal / totalGlosadoF) * 100 : 0;

                    return (
                      <>
                        <div
                          style={{ width: `${pRec}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-[9px] text-white justify-center bg-teal-600 font-mono"
                          title="Recuperado"
                        >
                          {pRec > 15 ? `${pRec.toFixed(1)}% Deferido` : ''}
                        </div>
                        <div
                          style={{ width: `${pEmRec}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-[9px] text-white justify-center bg-amber-500 font-mono"
                          title="Em recurso"
                        >
                          {pEmRec > 15 ? `${pEmRec.toFixed(1)}% Em Recurso` : ''}
                        </div>
                        <div
                          style={{ width: `${pOpen}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-[9px] text-white justify-center bg-red-400 font-mono"
                          title="Aberto"
                        >
                          {pOpen > 15 ? `${pOpen.toFixed(1)}% Aberto` : ''}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="flex gap-4 justify-center text-[10px] font-mono text-slate-450 mt-1 leading-none">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-teal-600"></span> Deferidos (Recuperados)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Em Recurso Ativos
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-red-400"></span> Sem Recurso (Abertas)
                </span>
              </div>
            </div>

            {/* List Table of Audit overview */}
            <div className="pt-4 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Inventário Geral das Inconsistências</span>
              <table className="w-full text-left text-xs text-slate-600 font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Prestador de Serviço</th>
                    <th className="py-2.5 px-3">Protocolo de Origem</th>
                    <th className="py-2.5 px-3">Operadora</th>
                    <th className="py-2.5 px-3">Preço Glosa</th>
                    <th className="py-2.5 px-3 text-right">Status do Ofício</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGlosas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 italic font-mono text-[11px]">
                        Nenhuma glosa audita para este plano.
                      </td>
                    </tr>
                  ) : (
                    filteredGlosas.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{g.paciente}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-blue-700 font-bold">{g.numeroGuia}</td>
                        <td className="py-2.5 px-3">{getPlanoNome(g.planoId)}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold">{formatCurrency(g.valorGlosado)}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              g.status === 'Aberta'
                                ? 'bg-red-50 text-red-700'
                                : g.status === 'Em recurso'
                                ? 'bg-amber-50 text-amber-750'
                                : 'bg-teal-50 text-teal-700'
                            }`}
                          >
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. GLOSAS ABERTAS */}
        {reportType === 'abertas' && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" /> Glosas Pendentes de Postagem Recursal (Glosas Abertas)
            </h3>
            <p className="text-xs text-slate-400">
              Estas guias de atendimento estão atualmente retidas pelas seguradoras de saúde. Elas necessitam de justificativa técnica e ofício urgente.
            </p>

            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-250">
                  <th className="py-2 px-3">Prestador de Serviço</th>
                  <th className="py-2 px-3">Protocolo de origem</th>
                  <th className="py-2 px-3">Data Bloqueio</th>
                  <th className="py-2 px-3">Razão do Apontamento</th>
                  <th className="py-2 px-3 text-right">Preço Retido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGlosas.filter((g) => g.status === 'Aberta').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-emerald-600 font-semibold font-mono">
                      Fantástico! Não existem glosas em aberto pendentes de ação.
                    </td>
                  </tr>
                ) : (
                  filteredGlosas
                    .filter((g) => g.status === 'Aberta')
                    .map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-medium text-slate-900">{g.paciente}</td>
                        <td className="py-3 px-3 font-mono text-blue-700 font-bold">{g.numeroGuia}</td>
                        <td className="py-3 px-3 font-mono">{g.dataGlosa}</td>
                        <td className="py-3 px-3 max-w-sm truncate text-slate-500" title={g.motivoGlosa}>
                          {g.motivoGlosa}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(g.valorGlosado)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. RECURSOS DEFERIDOS */}
        {reportType === 'deferidos' && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Recursos Médicos Julgados Deferidos (Sucesso Técnico)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Apelações que foram convalidadas pela junta julgadora das seguradoras, comprovando a eficácia e validade do tratamento clínico cobrado.
            </p>

            <div className="space-y-4 pt-2">
              {recursosDeferidos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-xs font-mono bg-slate-50 rounded-lg">
                  Nenhum recurso obteve decisão favorável de DEFERIMENTO até o momento.
                </div>
              ) : (
                recursosDeferidos.map((rec) => {
                  const glosa = glosas.find((g) => g.id === rec.glosaId);
                  return (
                    <div key={rec.id} className="p-4 bg-emerald-50 bg-opacity-30 border border-emerald-150 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-mono text-emerald-800 font-bold">Ofício ID #{rec.id}</span>
                        <span className="font-mono text-slate-450">Decisão publicada em: {rec.dataEnvio}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-700">
                        <div>Prestador de Serviço: <b className="text-slate-900">{glosa?.paciente}</b></div>
                        <div>Protocolo de origem: <b className="font-mono text-blue-700">{glosa?.numeroGuia}</b></div>
                        <div>Capital Recuperado: <b className="text-emerald-700">{formatCurrency(glosa?.valorGlosado || 0)}</b></div>
                      </div>

                      <div className="p-2.5 bg-white bg-opacity-80 rounded text-xs text-slate-600 border border-emerald-100 leading-relaxed font-mono">
                        <b>Nosso Memorial:</b> "{rec.textoRecurso}"
                      </div>

                      {rec.retornoConvenio && (
                        <div className="p-2.5 bg-emerald-100/40 rounded text-xs text-emerald-900">
                          <b>Despacho Oficial do Convênio:</b> "{rec.retornoConvenio}"
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 4. VALORES RECUPERADOS */}
        {reportType === 'recuperados' && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-teal-700" /> Demonstrativo Sintético de Receita Recuperada
            </h3>
            <p className="text-xs text-slate-400">
              Quadro de reconciliação de valores estornados após auditoria para fins de auditoria de fluxo de caixa institucional.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-mono">Total Estornado de Glosas</span>
                <h4 className="text-lg font-bold text-teal-700">{formatCurrency(totalValoresRecuperados)}</h4>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-mono">Total Sob Julgamento</span>
                <h4 className="text-lg font-bold text-slate-750">
                  {formatCurrency(
                    filteredGlosas
                      .filter(g => g.status === 'Em recurso')
                      .reduce((acc, curr) => acc + curr.valorGlosado, 0)
                  )}
                </h4>
              </div>
            </div>

            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-205">
                  <th className="py-2 px-3">Prestador Solicitante</th>
                  <th className="py-2 px-3">Protocolo de origem</th>
                  <th className="py-2 px-3">Convênio Responsável</th>
                  <th className="py-2 px-3 text-right">Status do Recurso</th>
                  <th className="py-2 px-3 text-right">Ativo Recuperado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGlosas.filter((g) => {
                  const rec = recursos.find((r) => r.glosaId === g.id);
                  return rec && rec.status === 'Deferido';
                }).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic font-mono">
                      Nenhum montante estornado sob conciliação de deferimento até o momento.
                    </td>
                  </tr>
                ) : (
                  filteredGlosas
                    .filter((g) => {
                      const rec = recursos.find((r) => r.glosaId === g.id);
                      return rec && rec.status === 'Deferido';
                    })
                    .map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-medium text-slate-900">{g.paciente}</td>
                        <td className="py-3 px-3 font-mono text-blue-750 font-semibold">{g.numeroGuia}</td>
                        <td className="py-3 px-3">{getPlanoNome(g.planoId)}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">
                            Deferido
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-teal-700">
                          {formatCurrency(g.valorGlosado)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Disclaimer / footer note for prints */}
        <div className="border-t border-slate-200 pt-5 text-[10px] text-slate-400 text-center font-mono">
          <p>ESTE TERMO DE COMPROVAÇÃO DE CRÉDITO DE GLOSA É DOCUMENTAL E REFERE-SE À PRESTAÇÃO DE SERVIÇOS EM SAÚDE.</p>
          <p className="mt-1">GERADO EXCLUSIVAMENTE PELO SISTEMA DE MODELAGEM DE GLOSAS RELACIONAIS © 2026.</p>
        </div>
      </div>
    </div>
  );
}
