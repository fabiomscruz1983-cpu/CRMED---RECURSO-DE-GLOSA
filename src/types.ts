/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Plano {
  id: number;
  nome: string;
  contato: string;
  email: string;
}

export type StatusGlosa = 'Aberta' | 'Em recurso' | 'Finalizada';

export interface Glosa {
  id: number;
  planoId: number; // Foreign key para Plano
  paciente: string; // contains Prestador name
  numeroGuia: string; // contains Protocolo de Origem
  motivoGlosa: string;
  valorGlosado: number;
  dataGlosa: string; // YYYY-MM-DD
  status: StatusGlosa;
  responsavel?: string; // Nome do auditor/atribuído
  protocoloRecurso?: string; // Novo campo: número de protocolo do recurso
  prazoLimite?: string; // Novo campo: data limite para recurso (YYYY-MM-DD)
}

export type StatusRecurso = 'Aguardando' | 'Em análise' | 'Deferido' | 'Indeferido';

export interface Recurso {
  id: number;
  glosaId: number; // Foreign key para Glosa
  textoRecurso: string;
  dataEnvio: string; // YYYY-MM-DD
  status: StatusRecurso;
  retornoConvenio: string;
  anexoNome?: string;
  anexoTamanho?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO String
  read: boolean;
  type: 'status_change' | 'assignment' | 'alert' | 'success';
  glosaId?: number;
  recursoId?: number;
  newValue?: string;
}

