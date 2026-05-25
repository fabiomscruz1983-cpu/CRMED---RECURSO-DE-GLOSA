/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plano } from '../types';
import { PlusCircle, Edit3, Trash2, Check, X, Shield, Contact, Mail } from 'lucide-react';

interface PlanosViewProps {
  planos: Plano[];
  onAddPlano: (plano: Omit<Plano, 'id'>) => void;
  onEditPlano: (plano: Plano) => void;
  onDeletePlano: (id: number) => void;
}

export default function PlanosView({ planos, onAddPlano, onEditPlano, onDeletePlano }: PlanosViewProps) {
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [email, setEmail] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editContato, setEditContato] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMessage('O nome do convênio/plano é obrigatório.');
      return;
    }
    onAddPlano({
      nome: nome.trim(),
      contato: contato.trim(),
      email: email.trim(),
    });

    // Reset fields
    setNome('');
    setContato('');
    setEmail('');
    setIsAdding(false);
    setErrorMessage('');
  };

  const startEdit = (plano: Plano) => {
    setEditingId(plano.id);
    setEditNome(plano.nome);
    setEditContato(plano.contato);
    setEditEmail(plano.email);
  };

  const handleSaveEdit = (id: number) => {
    if (!editNome.trim()) {
      alert('O nome do convênio/plano é obrigatório.');
      return;
    }
    onEditPlano({
      id,
      nome: editNome.trim(),
      contato: editContato.trim(),
      email: editEmail.trim(),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
            Cadastro de Convênios
          </h1>
          <p className="text-xs text-slate-400">
            Cadastre e edite as operadoras de saúde integradas ao sistema de auditoria de glosas.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 font-sans font-medium text-white px-4 py-2.5 rounded-xl text-xs cursor-pointer select-none transition-colors shadow-xs"
        >
          {isAdding ? (
            <>
              <X className="w-4 h-4" /> Cancelar Cadastro
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" /> Novo Convênio
            </>
          )}
        </button>
      </div>

      {/* Insert Block Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-5 border border-teal-500/20 shadow-md space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-mono font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Adicionar Novo Convênio
            </h3>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nome Fantasia do Plano *</label>
              <input
                type="text"
                placeholder="Ex. Amil Regional, Unimed Paulistana..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contato do Responsável</label>
              <input
                type="text"
                placeholder="Ex. Dr. Carlos (Diretor Técnico)"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">E-mail para Envio de Recursos</label>
              <input
                type="email"
                placeholder="Ex. recursos@operadora.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setErrorMessage('');
              }}
              className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-600 text-xs font-semibold cursor-pointer"
            >
              Gravar Convênio
            </button>
          </div>
        </form>
      )}

      {/* Convênios List */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-mono uppercase">
                <th className="py-3 px-4 font-semibold w-16">ID</th>
                <th className="py-3 px-4 font-semibold">Nome do Convênio</th>
                <th className="py-3 px-4 font-semibold">Contato Técnico</th>
                <th className="py-3 px-4 font-semibold">E-mail de Ofício</th>
                <th className="py-3 px-4 font-semibold text-right w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {planos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-mono">
                    Nenhum convênio cadastrado no momento. Use o botão acima para cadastrar.
                  </td>
                </tr>
              ) : (
                planos.map((plano) => {
                  const isEditing = editingId === plano.id;
                  return (
                    <tr key={plano.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-400">
                        #{plano.id}
                      </td>

                      {/* Nome */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editNome}
                            onChange={(e) => setEditNome(e.target.value)}
                            className="border border-slate-200 rounded p-1.5 w-full text-xs outline-none focus:border-teal-500"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            {plano.nome}
                          </div>
                        )}
                      </td>

                      {/* Contato */}
                      <td className="py-3 px-4 text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editContato}
                            onChange={(e) => setEditContato(e.target.value)}
                            className="border border-slate-200 rounded p-1.5 w-full text-xs outline-none focus:border-teal-500"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Contact className="w-3.5 h-3.5 text-slate-400" />
                            {plano.contato || <span className="text-slate-400 italic">Não informado</span>}
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-600">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="border border-slate-200 rounded p-1.5 w-full text-xs outline-none focus:border-teal-500"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {plano.email ? (
                              <span className="font-mono">{plano.email}</span>
                            ) : (
                              <span className="text-slate-400 italic">Não informado</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(plano.id)}
                              className="p-1 px-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md border border-teal-200 flex items-center justify-center cursor-pointer"
                              title="Salvar alterações"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md flex items-center justify-center cursor-pointer"
                              title="Cancelar edição"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1 px-1.5">
                            <button
                              onClick={() => startEdit(plano)}
                              className="p-1 text-slate-500 hover:bg-slate-100 rounded-md hover:text-slate-800 flex items-center justify-center cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deseja realmente remover o convênio "${plano.nome}"? Isso causará a remoção de todas as glosas correspondentes devido às restrições SQL de CASCADE.`)) {
                                  onDeletePlano(plano.id);
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
