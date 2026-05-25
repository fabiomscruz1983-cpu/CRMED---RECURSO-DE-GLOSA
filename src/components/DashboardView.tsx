/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plano, Glosa, Recurso } from '../types';
import { Activity, ShieldAlert, Award, FileText, FileClock, CheckCircle, Database, HelpCircle } from 'lucide-react';

interface DashboardViewProps {
  planos: Plano[];
  glosas: Glosa[];
  recursos: Recurso[];
  onNavigateToGlosas: () => void;
  onNavigateToRecursos: () => void;
  onNavigateToPlanos: () => void;
}

export default function DashboardView({
  planos,
  glosas,
  recursos,
  onNavigateToGlosas,
  onNavigateToRecursos,
  onNavigateToPlanos,
}: DashboardViewProps) {
  // 1. Total Glosado (Soma de todos os valores de glosa)
  const totalGlosado = glosas.reduce((acc, curr) => acc + curr.valorGlosado, 0);

  // 2. Total Recuperado (Soma de valores de glosas onde o recurso foi "Deferido")
  const totalRecuperado = glosas.reduce((acc, currGlosa) => {
    const recursoAssociado = recursos.find(r => r.glosaId === currGlosa.id);
    if (recursoAssociado && recursoAssociado.status === 'Deferido') {
      return acc + currGlosa.valorGlosado;
    }
    return acc;
  }, 0);

  // 3. Recursos Pendentes (Aguardando ou Em análise)
  const recursosPendentes = recursos.filter(
    (r) => r.status === 'Aguardando' || r.status === 'Em análise'
  ).length;

  // 4. Quantidade de Glosas (Total)
  const totalGlosasCount = glosas.length;

  // Cálculos adicionais para enriquecer o Dashboard
  const taxaRecuperacao = totalGlosado > 0 ? (totalRecuperado / totalGlosado) * 100 : 0;
  const glosasAbertas = glosas.filter(g => g.status === 'Aberta').length;
  const glosasEmRecurso = glosas.filter(g => g.status === 'Em recurso').length;
  const glosasFinalizadas = glosas.filter(g => g.status === 'Finalizada').length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Card */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-teal-800/30">
        <div className="max-w-3xl">
          <span className="bg-teal-500/20 text-teal-300 font-mono text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
            Painel Geral de Auditoria v1.0
          </span>
          <h1 className="text-3xl font-sans font-bold mt-3 tracking-tight">
            Gestão Integrada de Recursos de Glosa
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-xl">
            Monitore glosas médicas, controle os recursos enviados para convênios e mensure
            a taxa de recuperação financeira da sua instituição em tempo real.
          </p>
        </div>
      </div>

      {/* Main KPIs Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Glosado */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Total Glosado
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalGlosado)}
            </h3>
            <span className="text-xs text-slate-400 block mt-1">
              Soma total de auditorias adversas
            </span>
          </div>
        </div>

        {/* KPI 2: Total Recuperado */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Total Recuperado
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-sans font-bold text-teal-700 tracking-tight">
              {formatCurrency(totalRecuperado)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs bg-teal-100 text-teal-800 font-medium px-1.5 py-0.5 rounded">
                {taxaRecuperacao.toFixed(1)}% de sucesso
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Recursos Pendentes */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Recursos Pendentes
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
              {recursosPendentes}
            </h3>
            <span className="text-xs text-slate-400 block mt-1">
              Em análise ou aguardando envio
            </span>
          </div>
        </div>

        {/* KPI 4: Quantidade de Glosas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Quantidade Glosas
            </span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
              {totalGlosasCount}
            </h3>
            <span className="text-xs text-slate-400 block mt-1">
              Carga total registrada no sistema
            </span>
          </div>
        </div>
      </div>

      {/* Visual Breakdowns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown Panel */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs lg:col-span-1">
          <h2 className="text-sm font-mono font-bold text-slate-905 uppercase tracking-wide flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-teal-600" />
            Status das Glosas
          </h2>

          <div className="space-y-5">
            {/* Status Aberta */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>
                  Aberta (Sem recurso criado)
                </span>
                <span className="font-mono">{glosasAbertas} ({totalGlosasCount > 0 ? Math.round((glosasAbertas / totalGlosasCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalGlosasCount > 0 ? (glosasAbertas / totalGlosasCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Status Em Recurso */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                  Em Recurso (Aguardando/Em Análise)
                </span>
                <span className="font-mono">{glosasEmRecurso} ({totalGlosasCount > 0 ? Math.round((glosasEmRecurso / totalGlosasCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalGlosasCount > 0 ? (glosasEmRecurso / totalGlosasCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Status Finalizada */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 block"></span>
                  Finalizada
                </span>
                <span className="font-mono">{glosasFinalizadas} ({totalGlosasCount > 0 ? Math.round((glosasFinalizadas / totalGlosasCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalGlosasCount > 0 ? (glosasFinalizadas / totalGlosasCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400 space-y-2">
            <span className="font-medium text-slate-500 block">Distribuição Financeira Recente:</span>
            <div className="flex justify-between">
              <span>Média de valor por glosa:</span>
              <span className="font-mono text-slate-700">
                {formatCurrency(totalGlosasCount > 0 ? totalGlosado / totalGlosasCount : 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Convênios cadastrados:</span>
              <span className="font-mono text-slate-700">{planos.length} planos</span>
            </div>
          </div>
        </div>

        {/* Quick Action / Fluxograma Box */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-slate-600" />
              Fluxo Legal do Recurso de Glosa
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Entenda como fluem os estados contratuais no faturamento hospitalar:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-mono font-semibold text-red-500">Passo 1</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Glosa Aberta</div>
                <p className="text-[10px] text-slate-400 mt-1">Guia médica retida pelo convênio por inconsistência.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-mono font-semibold text-amber-500">Passo 2</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Recurso Criado</div>
                <p className="text-[10px] text-slate-400 mt-1">Justificativa técnica formulada e protocolada.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-mono font-semibold text-blue-500">Passo 3</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Em Análise</div>
                <p className="text-[10px] text-slate-400 mt-1">Junstificativa sob auditoria médica do convênio.</p>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                <div className="text-xs font-mono font-semibold text-teal-600">Passo 4</div>
                <div className="text-sm font-bold text-teal-800 mt-1">Retorno / Finalizado</div>
                <p className="text-[10px] text-teal-600/70 mt-1">Deferimento (valor pago) ou indeferimento oficial.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              onClick={onNavigateToGlosas}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Auditar Novas Glosas
            </button>
            <button
              onClick={onNavigateToRecursos}
              className="px-4 py-2 bg-teal-700 text-white hover:bg-teal-600 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Consultar Meus Recursos
            </button>
            <button
              onClick={onNavigateToPlanos}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Lista de Convênios
            </button>
          </div>
        </div>
      </div>

      {/* Relational Database Schema Blueprints - SUPER CLEVER & AWESOME INTERACTIVE SCHEMA VIEW! */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/60 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold font-sans text-slate-900">
                Banco de Dados Simplificado (SQLite Relacional)
              </h3>
              <p className="text-xs text-slate-400">
                Visualização interativa das tabelas com chaves estrangeiras implementadas localmente.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded">
            FOREIGN KEY triggers: ON CHANGE CASCADE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Table 1: planos */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="font-mono text-xs font-bold text-indigo-700 border-b border-indigo-100 pb-2 mb-2 flex justify-between items-center">
              <span>TABLE: planos</span>
              <span className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-500 font-normal">SQLite</span>
            </div>
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="py-1">Atributo</th>
                  <th className="py-1">Tipo</th>
                  <th className="py-1">Constraint</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr>
                  <td className="py-1 text-slate-900 font-semibold">id</td>
                  <td className="py-1">INTEGER</td>
                  <td className="py-1 text-teal-600">PRIMARY KEY</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-905 font-medium">nome</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">NOT NULL</td>
                </tr>
                <tr>
                  <td className="py-1">contato</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">--</td>
                </tr>
                <tr>
                  <td className="py-1">email</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">--</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 2: glosas */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="font-mono text-xs font-bold text-indigo-700 border-b border-indigo-100 pb-2 mb-2 flex justify-between items-center">
              <span>TABLE: glosas</span>
              <span className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-500 font-normal">SQLite</span>
            </div>
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="py-1">Atributo</th>
                  <th className="py-1">Tipo</th>
                  <th className="py-1">Constraint</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr>
                  <td className="py-1 text-slate-900 font-semibold">id</td>
                  <td className="py-1">INTEGER</td>
                  <td className="py-1 text-teal-600">PRIMARY KEY</td>
                </tr>
                <tr>
                  <td className="py-1 text-amber-600">plano_id</td>
                  <td className="py-1">INTEGER</td>
                  <td className="py-1 text-amber-600">FK (planos)</td>
                </tr>
                <tr>
                  <td className="py-1">prestador</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">--</td>
                </tr>
                <tr>
                   <td className="py-1">protocolo_origem</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">--</td>
                </tr>
                <tr>
                  <td className="py-1">motivo_glosa</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">--</td>
                </tr>
                <tr>
                  <td className="py-1">valor_glosado</td>
                  <td className="py-1">REAL</td>
                  <td className="py-1">--</td>
                </tr>
                <tr>
                  <td className="py-1">data_glosa</td>
                  <td className="py-1">DATE</td>
                  <td className="py-1">--</td>
                </tr>
                <tr>
                  <td className="py-1">status</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">"Aberta"|"Em recurso"|...</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 3: recursos */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="font-mono text-xs font-bold text-indigo-700 border-b border-indigo-100 pb-2 mb-2 flex justify-between items-center">
              <span>TABLE: recursos</span>
              <span className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-500 font-normal">SQLite</span>
            </div>
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="py-1">Atributo</th>
                  <th className="py-1">Tipo</th>
                  <th className="py-1">Constraint</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr>
                  <td className="py-1 text-slate-900 font-semibold">id</td>
                  <td className="py-1">INTEGER</td>
                  <td className="py-1 text-teal-600">PRIMARY KEY</td>
                </tr>
                <tr>
                  <td className="py-1 text-amber-600">glosa_id</td>
                  <td className="py-1">INTEGER</td>
                  <td className="py-1 text-amber-600">FK (glosas)</td>
                </tr>
                <tr>
                  <td className="py-1">texto_recurso</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">--</td>
                </tr>
                <tr>
                  <td className="py-1">data_envio</td>
                  <td className="py-1">DATE</td>
                  <td className="py-1">--</td>
                </tr>
                <tr>
                  <td className="py-1">status</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">"Aguardando"|...</td>
                </tr>
                <tr>
                  <td className="py-1">retorno_convenio</td>
                  <td className="py-1">TEXT</td>
                  <td className="py-1">--</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
