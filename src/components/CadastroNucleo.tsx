import React, { useState } from 'react';
import { createDefaultDocs, DEFAULT_ID_DOCS_NUCLEUS, DEFAULT_INCOME_DOCS_NUCLEUS } from '../constants';
import { DocStatus, NucleusMember } from '../types';
import { useAppContext } from '../context/AppContext';
import { Check, Info, Pencil, Trash2, X, Users } from 'lucide-react';
import { StudentSelect } from './StudentSelect';

export function CadastroNucleo() {
  const { 
    state, 
    addNucleusMember, 
    updateNucleusMember, 
    deleteNucleusMember,
    selectedStudentIdForNucleus,
    setSelectedStudentIdForNucleus
  } = useAppContext();
  
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');

  /* 
   * COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB:
   * Efeito secundário que consome o ID do estudante pré-selecionado globalmente.
   * Quando o usuário é redirecionado do Cadastro de Estudantes, o formulário de grupo
   * familiar foca automaticamente neste estudante, facilitando o preenchimento em lote.
   */
  React.useEffect(() => {
    if (selectedStudentIdForNucleus) {
      setStudentId(selectedStudentIdForNucleus);
      setSelectedStudentIdForNucleus(null); // Consumado, limpa para evitar loops ou re-seleções indesejadas
    }
  }, [selectedStudentIdForNucleus, setSelectedStudentIdForNucleus]);
  
  const [idDocs, setIdDocs] = useState(createDefaultDocs(DEFAULT_ID_DOCS_NUCLEUS));
  const [incomeDocs, setIncomeDocs] = useState(createDefaultDocs(DEFAULT_INCOME_DOCS_NUCLEUS));
  
  const [incomeValue, setIncomeValue] = useState<number>(0);
  const [success, setSuccess] = useState('');

  const handleDocChange = (type: 'id' | 'income', index: number, field: string, value: string) => {
    const list = type === 'id' ? [...idDocs] : [...incomeDocs];
    list[index] = { ...list[index], [field]: value };
    if (type === 'id') setIdDocs(list);
    else setIncomeDocs(list);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !name) {
      alert("Selecione um estudante e insira o nome do integrante familiar.");
      return;
    }

    const memberData: NucleusMember = {
      id: editingMemberId || crypto.randomUUID(),
      studentId,
      name,
      idDocs,
      incomeDocs,
      incomeValue,
    };

    if (editingMemberId) {
      await updateNucleusMember(memberData);
      setSuccess('Integrante do grupo familiar atualizado com sucesso!');
    } else {
      await addNucleusMember(memberData);
      setSuccess('Integrante do grupo familiar adicionado com sucesso!');
    }
    
    resetForm();
    setTimeout(() => setSuccess(''), 3000);
  };

  const startEdit = (member: NucleusMember) => {
    setEditingMemberId(member.id);
    setName(member.name);
    setIdDocs(member.idDocs);
    setIncomeDocs(member.incomeDocs);
    setIncomeValue(member.incomeValue);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async (id: string) => {
    await deleteNucleusMember(id);
    setDeletingMemberId(null);
    setSuccess('Integrante removido do grupo familiar.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const resetForm = () => {
    setEditingMemberId(null);
    setName('');
    setIdDocs(createDefaultDocs(DEFAULT_ID_DOCS_NUCLEUS));
    setIncomeDocs(createDefaultDocs(DEFAULT_INCOME_DOCS_NUCLEUS));
    setIncomeValue(0);
  };

  /* 
   * COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB:
   * StatusSelect estilizado de forma unificada à ficha de estudantes para prezar 
   * pela consistência de identidade visual e acessibilidade de cores do sistema.
   */
  const StatusSelect = ({ val, onChange }: { val: DocStatus, onChange: (v: string) => void }) => (
    <select 
      value={val} 
      onChange={(e) => onChange(e.target.value)}
      className={`border text-[11px] font-semibold rounded-lg px-2 py-1.5 transition-all outline-none focus:ring-2 cursor-pointer ${
        val === 'Completo' 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-250 focus:ring-emerald-200' 
          : val === 'Incompleto' 
          ? 'bg-amber-50 text-amber-705 border-amber-250 focus:ring-amber-200' 
          : val === 'Não Enviou' 
          ? 'bg-rose-50 text-rose-705 border-rose-250 focus:ring-rose-200' 
          : 'bg-slate-50 text-slate-500 border-slate-200 focus:ring-slate-200'
      }`}
    >
      <option value="Completo">Completo</option>
      <option value="Incompleto">Incompleto</option>
      <option value="Não Enviou">Não Enviou</option>
      <option value="Não se Aplica">Não se Aplica</option>
    </select>
  );

  const filteredMembers = state.nucleusMembers.filter(member => member.studentId === studentId);
  const selectedStudent = state.students.find(s => s.id === studentId);

  // Auxiliar para as siglas das fotos de perfil dos membros do grupo
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().replaceAll(/\s+/g, ' ').split(' ');
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-205 bg-slate-50 px-6 py-4 flex justify-between items-center border-l-4 border-l-indigo-600">
          <div>
            <h2 className="text-md font-bold text-slate-800 tracking-tight">
              {editingMemberId ? `Editar Integrante: ${name}` : 'Composição do Grupo Familiar'}
            </h2>
            <p className="text-xs text-slate-550 mt-1">
              {editingMemberId ? 'Altere a documentação e rendimentos deste familiar.' : 'Vincule as pessoas que residem de forma compartilhada com o estudante.'}
            </p>
          </div>
          {editingMemberId && (
            <button 
              onClick={resetForm}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-250 shadow-sm transition-colors cursor-pointer"
            >
              Cancelar Edição
            </button>
          )}
        </div>

        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-707 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold">{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Estudante Responsável</label>
              <StudentSelect
                students={state.students}
                value={studentId}
                onChange={(id) => {
                  setStudentId(id);
                  resetForm();
                }}
                placeholder="Selecione ou busque o estudante..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Nome do Familiar / Integrante</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border-slate-205 hover:border-slate-350 bg-white rounded-xl shadow-sm border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 font-semibold transition-all" 
                required 
                disabled={!studentId} 
                placeholder={studentId ? "Nome completo do integrante" : "Selecione o estudante primeiro"} 
              />
            </div>
          </div>

          {studentId ? (
            <>
              {/* COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB: Listas de documentos de familiares idênticas às de estudantes com marcadores visuais laterais coloridos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 border-b border-slate-150 pb-2 flex items-center gap-2 uppercase tracking-widest">
                    <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
                    Comprovação de Identificação
                  </h3>
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {idDocs.map((doc, i) => {
                      const isNotApplicable = doc.status === 'Não se Aplica';
                      const activeBorderClasses: Record<DocStatus, string> = {
                        'Completo': 'border-l-4 border-l-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20 border-slate-150',
                        'Incompleto': 'border-l-4 border-l-amber-500 bg-amber-50/10 hover:bg-amber-50/20 border-slate-155',
                        'Não Enviou': 'border-l-4 border-l-rose-500 bg-rose-50/10 hover:bg-rose-50/20 border-slate-155',
                        'Não se Aplica': 'border-l-4 border-l-slate-300 bg-slate-50/30 text-slate-400 border-slate-150'
                      };
                      const colorClass = activeBorderClasses[doc.status] || 'bg-white';

                      return (
                        <div key={i} className={`flex flex-col gap-2.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-xs md:hover:scale-[1.002] ${colorClass}`}>
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-slate-700 text-[11px] leading-tight select-none">
                              {doc.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-12 sm:col-span-5">
                              <StatusSelect val={doc.status} onChange={(v) => handleDocChange('id', i, 'status', v)} />
                            </div>
                            <div className="col-span-12 sm:col-span-7">
                              <input 
                                type="text" 
                                placeholder="Observações..." 
                                value={doc.observation || ''} 
                                onChange={e => handleDocChange('id', i, 'observation', e.target.value)} 
                                disabled={isNotApplicable} 
                                className="w-full border-slate-205 bg-white hover:border-slate-300 shadow-sm border rounded-lg py-1 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-105 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-150 transition-all font-semibold text-slate-700" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 border-b border-slate-150 pb-2 flex items-center gap-2 uppercase tracking-widest">
                    <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full"></span>
                    Comprovação de Rendimentos
                  </h3>
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {incomeDocs.map((doc, i) => {
                      const isNotApplicable = doc.status === 'Não se Aplica';
                      const activeBorderClasses: Record<DocStatus, string> = {
                        'Completo': 'border-l-4 border-l-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20 border-slate-150',
                        'Incompleto': 'border-l-4 border-l-amber-500 bg-amber-50/10 hover:bg-amber-50/20 border-slate-155',
                        'Não Enviou': 'border-l-4 border-l-rose-500 bg-rose-50/10 hover:bg-rose-50/20 border-slate-155',
                        'Não se Aplica': 'border-l-4 border-l-slate-300 bg-slate-50/30 text-slate-400 border-slate-150'
                      };
                      const colorClass = activeBorderClasses[doc.status] || 'bg-white';

                      return (
                        <div key={i} className={`flex flex-col gap-2.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-xs md:hover:scale-[1.002] ${colorClass}`}>
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-slate-700 text-[11px] leading-tight select-none">
                              {doc.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-12 sm:col-span-5">
                              <StatusSelect val={doc.status} onChange={(v) => handleDocChange('income', i, 'status', v)} />
                            </div>
                            <div className="col-span-12 sm:col-span-7">
                              <input 
                                type="text" 
                                placeholder="Observações..." 
                                value={doc.observation || ''} 
                                onChange={e => handleDocChange('income', i, 'observation', e.target.value)} 
                                disabled={isNotApplicable} 
                                className="w-full border-slate-205 bg-white hover:border-slate-300 shadow-sm border rounded-lg py-1 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-105 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-150 transition-all font-semibold text-slate-700" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB: Rendimento individual do integrante formatado em um painel KPI compacto */}
              <div className="border-t border-slate-200 pt-6">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors shadow-xs max-w-sm">
                  <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1">Renda Bruta Individual</span>
                  <label className="block text-xs font-bold text-slate-700 leading-normal mb-2">Rendimento Mensal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={incomeValue || ''} 
                      onChange={e => setIncomeValue(Number(e.target.value))} 
                      placeholder="0.00"
                      className="w-full border-slate-202 hover:border-slate-300 bg-white rounded-xl shadow-xs border py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 font-bold text-slate-800 transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-150">
                 {editingMemberId && (
                   <button 
                     type="button" 
                     onClick={resetForm}
                     className="cursor-pointer border border-slate-300 text-slate-755 font-bold py-2 px-6 rounded-xl text-xs hover:bg-slate-50 transition-colors"
                   >
                     Cancelar Edição
                   </button>
                 )}
                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors cursor-pointer">
                   {editingMemberId ? 'Salvar Alterações' : 'Adicionar Familiar'}
                 </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-slate-50/60 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
              Selecione um estudante acima para consultar ou gerenciar a composição de seu grupo familiar residente.
            </div>
          )}
        </form>
      </div>

      {/* List Card (Rendered only if a student is selected) */}
      {studentId && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-scaleIn">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between border-l-4 border-l-indigo-600">
            <div>
              <h2 className="text-md font-bold text-slate-850 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Grupo Familiar do Estudante
              </h2>
              <p className="text-xs text-slate-550 mt-1">
                Lista de familiares de <strong className="text-slate-800">{selectedStudent?.name}</strong> que compõem o domicílio.
              </p>
            </div>
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full shrink-0 shadow-xs">
              {filteredMembers.length} Familiar(es)
            </span>
          </div>

          <div className="divide-y divide-slate-150">
            {filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-slate-450 bg-slate-50/20 text-xs">
                Nenhum familiar cadastrado para este estudante. Adicione integrantes utilizando o formulário acima.
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-all duration-250">
                  <div className="flex items-center gap-3">
                    {/* Sigla circular como avatar customizado para melhor identificação visual */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-black shadow-xs shrink-0 select-none">
                      {getInitials(member.name)}
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 text-sm">{member.name}</span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Renda individual: <strong className="text-slate-700 font-semibold">R$ {member.incomeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">Familiar</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center ml-13 sm:ml-0">
                    {deletingMemberId === member.id ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 text-rose-705 py-1.5 px-3 rounded-lg border border-rose-200 text-xs font-semibold animate-scaleIn shadow-xs">
                        <span>Excluir?</span>
                        <button 
                          onClick={() => confirmDelete(member.id)}
                          className="p-1 text-rose-700 hover:bg-rose-200 hover:text-rose-900 rounded transition-colors mr-0.5 font-bold cursor-pointer"
                          title="Confirmar exclusão"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingMemberId(null)}
                          className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors font-bold cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEdit(member)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 rounded-lg transition-colors border border-transparent hover:border-indigo-105 cursor-pointer"
                          title="Editar cadastro de integrante"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingMemberId(member.id)}
                          className="p-2 text-rose-605 hover:bg-rose-50 hover:text-rose-850 rounded-lg transition-colors border border-transparent hover:border-rose-105 cursor-pointer"
                          title="Remover integrante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
