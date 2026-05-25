/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plano, Glosa, Recurso, SystemNotification } from '../types';

const STORAGE_KEYS = {
  PLANOS: 'glosa_system_planos',
  GLOSAS: 'glosa_system_glosas',
  RECURSOS: 'glosa_system_recursos',
  NOTIFICATIONS: 'glosa_system_notifications',
};

const INITIAL_PLANOS: Plano[] = [
  { id: 1, nome: 'Unimed Nacional', contato: 'Dra. Ana Paula (Auditoria)', email: 'auditoria@unimed.com.br' },
  { id: 2, nome: 'Bradesco Saúde', contato: 'Guilherme Santos', email: 'recursos.bradesco@saude.com.br' },
  { id: 3, nome: 'Amil Assistência', contato: 'Mariana Azevedo', email: 'glosas@amil.com.br' },
  { id: 4, nome: 'SulAmérica Saúde', contato: 'Roberto Lima', email: 'faturamento@sulamerica.com.br' },
];

const INITIAL_GLOSAS: Glosa[] = [
  {
    id: 1,
    planoId: 1,
    paciente: 'Hospital Geral de Clínicas S/A',
    numeroGuia: '4509123',
    motivoGlosa: 'Ausência de justificativa clínica para exame de ressonância magnética do joelho',
    valorGlosado: 1250.00,
    dataGlosa: '2026-05-10',
    status: 'Finalizada',
    responsavel: 'Fábio Cruz',
    protocoloRecurso: 'RECURSO-2026-0041',
    prazoLimite: '2026-06-12',
  },
  {
    id: 2,
    planoId: 2,
    paciente: 'Clínica de Traumatologia OrtoCenter',
    numeroGuia: '2283011',
    motivoGlosa: 'Divergência entre honorários médicos cobrados e tabela CBHPM contratada para o procedimento',
    valorGlosado: 680.00,
    dataGlosa: '2026-05-18',
    status: 'Em recurso',
    responsavel: 'Fábio Cruz',
    protocoloRecurso: 'RECURSO-2026-0098',
    prazoLimite: '2026-06-18',
  },
  {
    id: 3,
    planoId: 3,
    paciente: 'Instituto de Anestesiologia Dr. Mendes',
    numeroGuia: '8890212',
    motivoGlosa: 'Materiais descartáveis utilizados em sala cirúrgica não previstos no pacote acordado',
    valorGlosado: 450.00,
    dataGlosa: '2026-05-20',
    status: 'Aberta',
    responsavel: 'Dra. Ana Paula',
    protocoloRecurso: '',
    prazoLimite: '2026-06-20',
  },
  {
    id: 4,
    planoId: 4,
    paciente: 'Fisioterapia Integrada Reabilitar',
    numeroGuia: '1092837',
    motivoGlosa: 'Duplicidade de cobrança no mesmo dia para procedimento de fisioterapia respiratória',
    valorGlosado: 320.00,
    dataGlosa: '2026-05-22',
    status: 'Em recurso',
    responsavel: 'Guilherme Santos',
    protocoloRecurso: 'RECURSO-2026-0155',
    prazoLimite: '2026-06-22',
  },
  {
    id: 5,
    planoId: 1,
    paciente: 'Clínica Dermatológica Barbosa S/S',
    numeroGuia: '3344122',
    motivoGlosa: 'Ausência de assinatura do beneficiário na guia física de atendimento dermatológico',
    valorGlosado: 180.00,
    dataGlosa: '2026-05-24',
    status: 'Aberta',
    responsavel: 'Fábio Cruz',
    protocoloRecurso: '',
    prazoLimite: '2026-06-25',
  },
];

const INITIAL_RECURSOS: Recurso[] = [
  {
    id: 1,
    glosaId: 1,
    textoRecurso: 'Prezados auditores, encaminhamos em anexo o prontuário completo do beneficiário datado do dia do atendimento, contendo a justificativa médica assinada pelo ortopedista cooperado Dr. Renato Alves, comprovando a imperiosa necessidade científica da realização da ressonância de controle de estabilidade patelar.',
    dataEnvio: '2026-05-12',
    status: 'Deferido',
    retornoConvenio: 'Recurso acatado integralmente após análise técnica da junta auditora da Unimed. Crédito agendado para o próximo lote de faturamento.',
    anexoNome: 'prontuario_carlos_oliveira.pdf',
    anexoTamanho: '1.2 MB',
  },
  {
    id: 2,
    glosaId: 2,
    textoRecurso: 'Solicitamos a reanálise da guia de honorários cobrados, pois o código inserido corresponde exatamente ao porte anestésico 3B conforme anexo do relatório cirúrgico assinado, com a devida valoração da tabela CBHPM vigente, refutando a aparente glosa administrativa de divergência tarifária.',
    dataEnvio: '2026-05-19',
    status: 'Em análise',
    retornoConvenio: 'Aguardando parecer final do departamento de faturamento da Bradesco Saúde.',
    anexoNome: 'relatorio_cirurgico_anestesia.pdf',
    anexoTamanho: '840 KB',
  },
  {
    id: 3,
    glosaId: 4,
    textoRecurso: 'Esclarecemos que não houve duplicidade de cobrança, mas sim a realização de duas sessões de fisioterapia respiratória em turnos distintos (manhã e noite), motivadas pela súbita instabilidade de saturação de oxigênio relatada no prontuário de evolução de enfermagem.',
    dataEnvio: '2026-05-23',
    status: 'Aguardando',
    retornoConvenio: '',
    anexoNome: 'folha_de_evolucao_beatriz.pdf',
    anexoTamanho: '550 KB',
  },
];

export function getPlanos(): Plano[] {
  const data = localStorage.getItem(STORAGE_KEYS.PLANOS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PLANOS, JSON.stringify(INITIAL_PLANOS));
    return INITIAL_PLANOS;
  }
  return JSON.parse(data);
}

export function savePlanos(planos: Plano[]) {
  localStorage.setItem(STORAGE_KEYS.PLANOS, JSON.stringify(planos));
}

export function getGlosas(): Glosa[] {
  const data = localStorage.getItem(STORAGE_KEYS.GLOSAS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.GLOSAS, JSON.stringify(INITIAL_GLOSAS));
    return INITIAL_GLOSAS;
  }
  return JSON.parse(data);
}

export function saveGlosas(glosas: Glosa[]) {
  localStorage.setItem(STORAGE_KEYS.GLOSAS, JSON.stringify(glosas));
}

export function getRecursos(): Recurso[] {
  const data = localStorage.getItem(STORAGE_KEYS.RECURSOS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.RECURSOS, JSON.stringify(INITIAL_RECURSOS));
    return INITIAL_RECURSOS;
  }
  return JSON.parse(data);
}

export function saveRecursos(recursos: Recurso[]) {
  localStorage.setItem(STORAGE_KEYS.RECURSOS, JSON.stringify(recursos));
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'init-notif-1',
    title: '🔄 Recurso Deferido e Auditoria Finalizada',
    description: 'A Unimed Nacional emitiu parecer de DEFERIMENTO integral para o recurso da Guia 4509123 (Carlos Eduardo Oliveira). R$ 1.250,00 recuperados para a clínica.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
    read: false,
    type: 'success',
    glosaId: 1,
  },
  {
    id: 'init-notif-2',
    title: '📌 Nova Glosa Atribuída a Você',
    description: 'A glosa de Julia Souza de Andrade (Guia 2283011, valor de R$ 680,00) foi atribuída ao auditor Fábio Cruz para elaboração de recurso recursal clínico.',
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 horas atrás
    read: true,
    type: 'assignment',
    glosaId: 2,
  }
];

export function getNotifications(): SystemNotification[] {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  return JSON.parse(data);
}

export function saveNotifications(notifications: SystemNotification[]) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

// Helper para resetar os dados iniciais caso o usuário deseje
export function resetData() {
  localStorage.setItem(STORAGE_KEYS.PLANOS, JSON.stringify(INITIAL_PLANOS));
  localStorage.setItem(STORAGE_KEYS.GLOSAS, JSON.stringify(INITIAL_GLOSAS));
  localStorage.setItem(STORAGE_KEYS.RECURSOS, JSON.stringify(INITIAL_RECURSOS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
}
