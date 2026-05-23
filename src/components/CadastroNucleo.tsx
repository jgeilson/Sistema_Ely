import React, { useState } from 'react';
import { createDefaultDocs, DEFAULT_ID_DOCS_NUCLEUS, DEFAULT_INCOME_DOCS_NUCLEUS } from '../constants';
import { DocStatus, NucleusMember } from '../types';
import { useAppContext } from '../context/AppContext';
import { Check, Info, Pencil, Trash2, X, Users } from 'lucide-react';
import { StudentSelect } from './StudentSelect';

export function CadastroNucleo() {
  const { state, addNucleusMember, updateNucleusMember, deleteNucleusMember } = useAppContext();
  
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  
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

  const StatusSelect = ({ val, onChange }: { val: DocStatus, onChange: (v: string) => void }) => (
    <select 
      value={val} 
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded p-1 text-sm font-medium ${val === 'Completo' ? 'bg-green-50 text-green-755 border-green-200' : val === 'Incompleto' ? 'bg-yellow-50 text-yellow-755 border-yellow-200' : val === 'Não Enviou' ? 'bg-red-50 text-red-755 border-red-200' : 'bg-gray-50 text-gray-450 border-gray-200'}`}
    >
      <option value="Completo">Completo</option>
      <option value="Incompleto">Incompleto</option>
      <option value="Não Enviou">Não Enviou</option>
      <option value="Não se Aplica">Não se Aplica</option>
    </select>
  );

  const filteredMembers = state.nucleusMembers.filter(member => member.studentId === studentId);
  const selectedStudent = state.students.find(s => s.id === studentId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 rounded-t-xl px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {editingMemberId ? `Editar Integrante: ${name}` : 'Composição do Grupo Familiar'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
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
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-705 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="text-sm font-semibold">{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Estudante Responsável</label>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Nome do Familiar / Integrante</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 opacity-100 disabled:bg-slate-100 disabled:text-slate-400 font-medium" 
                required 
                disabled={!studentId} 
                placeholder={studentId ? "Digite o nome do familiar..." : "Selecione o estudante primeiro"} 
              />
            </div>
          </div>

          {studentId ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 border-b pb-2 flex items-center gap-2 uppercase tracking-wide">
                    <Info className="w-4 h-4 text-blue-500" /> Comprovação de Identificação
                  </h3>
                  {idDocs.map((doc, i) => {
                    const isNotApplicable = doc.status === 'Não se Aplica';
                    return (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-650 w-48 text-xs">{doc.name}</span>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <StatusSelect val={doc.status} onChange={(v) => handleDocChange('id', i, 'status', v)} />
                          <input 
                            type="text" 
                            placeholder="Obs / Informações..." 
                            value={doc.observation || ''} 
                            onChange={e => handleDocChange('id', i, 'observation', e.target.value)} 
                            disabled={isNotApplicable} 
                            className="border-slate-300 shadow-sm border rounded p-1 w-32 md:w-48 text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400" 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 border-b pb-2 flex items-center gap-2 uppercase tracking-wide">
                    <Info className="w-4 h-4 text-emerald-500" /> Comprovação de Rendimentos
                  </h3>
                  {incomeDocs.map((doc, i) => {
                    const isNotApplicable = doc.status === 'Não se Aplica';
                    return (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-650 w-48 text-xs">{doc.name}</span>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <StatusSelect val={doc.status} onChange={(v) => handleDocChange('income', i, 'status', v)} />
                          <input 
                            type="text" 
                            placeholder="Obs / Informações..." 
                            value={doc.observation || ''} 
                            onChange={e => handleDocChange('income', i, 'observation', e.target.value)} 
                            disabled={isNotApplicable} 
                            className="border-slate-300 shadow-sm border rounded p-1 w-32 md:w-48 text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400" 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="max-w-xs">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rendimento Mensal Individual (R$)</label>
                     <input 
                       type="number" 
                       step="0.01" 
                       value={incomeValue || ''} 
                       onChange={e => setIncomeValue(Number(e.target.value))} 
                       placeholder="R$ 0,00"
                       className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-700" 
                     />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                 {editingMemberId && (
                   <button 
                     type="button" 
                     onClick={resetForm}
                     className="cursor-pointer border border-slate-300 text-slate-705 font-semibold py-2 px-6 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                   >
                     Cancelar Edição
                   </button>
                 )}
                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors cursor-pointer">
                   {editingMemberId ? 'Salvar Alterações' : 'Adicionar Familiar'}
                 </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
              Por favor, selecione um estudante acima para gerenciar os membros familiares vinculados.
            </div>
          )}
        </form>
      </div>

      {/* List Card (Rendered only if a student is selected) */}
      {studentId && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-md font-bold text-slate-850 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-505" />
              Grupo Familiar de {selectedStudent?.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lista de familiares residentes na mesma habitação que compõem a receita per capita.
            </p>
          </div>

          <div className="divide-y divide-slate-150">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50/20 text-xs">
                Nenhum familiar cadastrado para este estudante até o momento. Adicione integrantes no formulário acima.
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 text-sm">{member.name}</span>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Rendimento: <strong>R$ {member.incomeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                      <span>•</span>
                      <span>Documentação verificada</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {deletingMemberId === member.id ? (
                      <div className="flex items-center gap-1.5 bg-red-50 text-red-700 py-1 px-2.5 rounded-lg border border-red-200 text-xs font-semibold animate-scaleIn">
                        <span>Excluir?</span>
                        <button 
                          onClick={() => confirmDelete(member.id)}
                          className="p-1 text-red-700 hover:bg-red-250 hover:text-red-900 rounded transition-colors mr-0.5 font-bold cursor-pointer"
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
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 cursor-pointer"
                          title="Editar cadastro de integrante"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingMemberId(member.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
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
