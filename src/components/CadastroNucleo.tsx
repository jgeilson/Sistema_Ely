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
      alert("Selecione um estudante e insira o nome do familiar.");
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
      setSuccess('Familiar atualizado com sucesso!');
    } else {
      await addNucleusMember(memberData);
      setSuccess('Familiar cadastrado com sucesso!');
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
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async (id: string) => {
    await deleteNucleusMember(id);
    setDeletingMemberId(null);
    setSuccess('Familiar excluído com sucesso!');
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
      className={`border rounded p-1 text-sm ${val === 'Completo' ? 'bg-green-50 text-green-700 border-green-200' : val === 'Incompleto' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : val === 'Não Enviou' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
    >
      <option value="Completo">Completo</option>
      <option value="Incompleto">Incompleto</option>
      <option value="Não Enviou">Não Enviou</option>
      <option value="Não se Aplica">Não se Aplica</option>
    </select>
  );

  // Filter core members belonging to the selected student
  const filteredMembers = state.nucleusMembers.filter(member => member.studentId === studentId);
  const selectedStudent = state.students.find(s => s.id === studentId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-slate-800">
              {editingMemberId ? 'Editar Familiar (Núcleo)' : 'Núcleo Familiar'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {editingMemberId ? 'Modifique as informações do membro familiar.' : 'Vincule familiares a um estudante cadastrado.'}
            </p>
          </div>
          {editingMemberId && (
            <button 
              onClick={resetForm}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded transition-colors"
            >
              Cancelar Edição
            </button>
          )}
        </div>

        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vincular Estudante (Busca)</label>
              <StudentSelect
                students={state.students}
                value={studentId}
                onChange={(id) => {
                  setStudentId(id);
                  resetForm(); // Reset form editing state since we changed student
                }}
                placeholder="Selecione ou busque o estudante..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Familiar</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 opacity-100 disabled:bg-slate-50" required disabled={!studentId} placeholder={studentId ? "Nome do familiar" : "Selecione um estudante primeiro"} />
            </div>
          </div>

          {studentId ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-slate-800 border-b pb-2 flex items-center gap-2"><Info className="w-4 h-4" /> ID (Núcleo)</h3>
                  {idDocs.map((doc, i) => {
                    const isNotApplicable = doc.status === 'Não se Aplica';
                    return (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-600 w-48">{doc.name}</span>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <StatusSelect val={doc.status} onChange={(v) => handleDocChange('id', i, 'status', v)} />
                          <input type="text" placeholder="Qual? / Obs..." value={doc.observation || ''} onChange={e => handleDocChange('id', i, 'observation', e.target.value)} disabled={isNotApplicable} className="border-slate-300 shadow-sm border rounded p-1 w-32 md:w-48 text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium text-slate-800 border-b pb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Renda (Núcleo)</h3>
                  {incomeDocs.map((doc, i) => {
                    const isNotApplicable = doc.status === 'Não se Aplica';
                    return (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-600 w-48">{doc.name}</span>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <StatusSelect val={doc.status} onChange={(v) => handleDocChange('income', i, 'status', v)} />
                          <input type="text" placeholder="Qual? / Obs..." value={doc.observation || ''} onChange={e => handleDocChange('income', i, 'observation', e.target.value)} disabled={isNotApplicable} className="border-slate-300 shadow-sm border rounded p-1 w-32 md:w-48 text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="max-w-xs">
                     <label className="block text-sm font-medium text-slate-700 mb-1">Renda Bruta Pessoal (R$)</label>
                     <input type="number" step="0.01" value={incomeValue || ''} onChange={e => setIncomeValue(Number(e.target.value))} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                 {editingMemberId && (
                   <button 
                     type="button" 
                     onClick={resetForm}
                     className="cursor-pointer border border-slate-300 text-slate-700 font-medium py-2 px-6 rounded-lg hover:bg-slate-50 transition-colors"
                   >
                     Cancelar
                   </button>
                 )}
                 <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer">
                   {editingMemberId ? 'Salvar Edição' : 'Salvar Familiar'}
                 </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-250 rounded-xl text-slate-500 text-sm">
              Por favor, selecione um estudante acima para gerenciar os membros familiares.
            </div>
          )}
        </form>
      </div>

      {/* List Card (Rendered only if a student is selected) */}
      {studentId && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Familiares de {selectedStudent?.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Gerencie os membros familiares vinculados a este estudante.</p>
          </div>

          <div className="divide-y divide-slate-150">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhum membro familiar cadastrado para este estudante.
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-800">{member.name}</span>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Renda: R$ {member.incomeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>•</span>
                      <span>Documentos cadastrados</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {deletingMemberId === member.id ? (
                      <div className="flex items-center gap-1.5 bg-red-50 text-red-700 py-1 px-2.5 rounded-lg border border-red-200 text-xs font-semibold">
                        <span>Excluir?</span>
                        <button 
                          onClick={() => confirmDelete(member.id)}
                          className="p-1 text-red-700 hover:bg-red-250 hover:text-red-900 rounded transition-colors mr-0.5"
                          title="Confirmar exclusão"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingMemberId(null)}
                          className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEdit(member)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                          title="Editar Familiar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingMemberId(member.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Excluir Familiar"
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
