import React, { useState } from 'react';
import { createDefaultDocs, DEFAULT_ID_DOCS_STUDENT, DEFAULT_INCOME_DOCS_STUDENT } from '../constants';
import { DocStatus, Student } from '../types';
import { useAppContext } from '../context/AppContext';
import { Check, Info, Trash2, X, Search, FilePenLine } from 'lucide-react';
import { EditalSelect } from './EditalSelect';
import { StudentSelect } from './StudentSelect';

export function CadastroEstudante() {
  const { state, addStudent, updateStudent, deleteStudent, getEditais } = useAppContext();
  const editais = getEditais();
  
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const [edital, setEdital] = useState(editais.length > 0 ? editais[editais.length - 1] : '');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  
  const [idDocs, setIdDocs] = useState(createDefaultDocs(DEFAULT_ID_DOCS_STUDENT));
  const [incomeDocs, setIncomeDocs] = useState(createDefaultDocs(DEFAULT_INCOME_DOCS_STUDENT));
  
  const [incomeValue, setIncomeValue] = useState<string>('');
  const [scores, setScores] = useState({ FE: '', RF: '', IV: '', FA: '' });
  const [success, setSuccess] = useState('');

  const handleDocChange = (type: 'id' | 'income', index: number, field: string, value: string) => {
    const list = type === 'id' ? [...idDocs] : [...incomeDocs];
    list[index] = { ...list[index], [field]: value };
    if (type === 'id') setIdDocs(list);
    else setIncomeDocs(list);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !edital) {
      alert("Edital, nome e cidade são obrigatórios.");
      return;
    }

    const studentData: Student = {
      id: editingStudentId || crypto.randomUUID(),
      name,
      city,
      edital: edital,
      idDocs,
      incomeDocs,
      incomeValue: Number(incomeValue) || 0,
      scores: {
        FE: Number(scores.FE) || 0,
        RF: Number(scores.RF) || 0,
        IV: Number(scores.IV) || 0,
        FA: Number(scores.FA) || 0,
      },
      createdAt: new Date().toISOString()
    };

    if (editingStudentId) {
      await updateStudent(studentData);
      setSuccess('Estudante atualizado com sucesso!');
    } else {
      await addStudent(studentData);
      setSuccess('Estudante cadastrado com sucesso!');
    }
    
    resetForm();
    setTimeout(() => setSuccess(''), 3000);
  };

  const startEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setIsNewRegistration(false);
    setDeletingStudentId(null);
    setName(student.name);
    setCity(student.city);
    setEdital(student.edital);
    setIdDocs(student.idDocs);
    setIncomeDocs(student.incomeDocs);
    setIncomeValue(student.incomeValue.toString());
    setScores({
      FE: student.scores.FE.toString(),
      RF: student.scores.RF.toString(),
      IV: student.scores.IV.toString(),
      FA: student.scores.FA.toString(),
    });
  };

  const confirmDelete = async (id: string) => {
    await deleteStudent(id);
    resetForm();
    setSuccess('Estudante excluído com sucesso!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const resetForm = () => {
    setEditingStudentId(null);
    setIsNewRegistration(false);
    setDeletingStudentId(null);
    setName('');
    setCity('');
    setIdDocs(createDefaultDocs(DEFAULT_ID_DOCS_STUDENT));
    setIncomeDocs(createDefaultDocs(DEFAULT_INCOME_DOCS_STUDENT));
    setIncomeValue('');
    setScores({ FE: '', RF: '', IV: '', FA: '' });
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Search Header/Toggle Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Gestão de Estudantes
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Busque um estudante cadastrado para editar/excluir ou inicie um novo cadastro.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => {
              resetForm();
              setIsNewRegistration(true);
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
              isNewRegistration && !editingStudentId
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
            }`}
          >
            + Cadastrar Novo Estudante
          </button>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Pesquisar Estudante Existente (Autocomplete)
          </label>
          <StudentSelect
            students={state.students}
            value={editingStudentId || ''}
            onChange={(selectedId) => {
              if (selectedId) {
                const found = state.students.find(s => s.id === selectedId);
                if (found) {
                  startEdit(found);
                }
              } else {
                resetForm();
              }
            }}
            placeholder="Digite o nome ou cidade do estudante..."
          />
        </div>
      </div>

      {success && (
        <div className="mx-0 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span className="font-medium text-sm">{success}</span>
        </div>
      )}

      {/* Main Registration/Edit Form Card */}
      {(editingStudentId || isNewRegistration) ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-scaleIn">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <FilePenLine className="w-5 h-5 text-slate-500" />
              <div>
                <h2 className="text-lg font-medium text-slate-800">
                  {editingStudentId ? `Editar Cadastro: ${name}` : 'Novo Cadastro de Estudante'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingStudentId ? 'Altere as informações cadastrais e salve.' : 'Verifique os dados cadastrais antes de salvar.'}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={resetForm}
              className="p-1 px-3 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 font-medium text-xs rounded-lg border border-slate-200 transition-colors shadow-sm cursor-pointer"
            >
              Fechar Formulário
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Edital / Processo Seletivo</label>
                <EditalSelect 
                  editais={editais} 
                  value={edital} 
                  onChange={setEdital} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Estudante</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-slate-800 border-b pb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Documentação de Identificação</h3>
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
                <h3 className="text-md font-medium text-slate-800 border-b pb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Documentação de Renda</h3>
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
              <h3 className="text-md font-medium text-slate-800 mb-4">Informações de Renda e Pontuação</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Renda Bruta (R$)</label>
                   <input type="number" step="0.01" value={incomeValue} onChange={e => setIncomeValue(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Pont. FE</label>
                   <input type="number" value={scores.FE} onChange={e => setScores({...scores, FE: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Pont. RF</label>
                   <input type="number" value={scores.RF} onChange={e => setScores({...scores, RF: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Pont. IV</label>
                   <input type="number" value={scores.IV} onChange={e => setScores({...scores, IV: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Pont. FA</label>
                   <input type="number" value={scores.FA} onChange={e => setScores({...scores, FA: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-3 pt-6 border-t border-slate-200">
               <div className="flex-1">
                 {editingStudentId && (
                   <>
                     {deletingStudentId === editingStudentId ? (
                       <div className="flex items-center gap-2 bg-red-50 text-red-700 py-2 px-3.5 rounded-lg border border-red-200 text-sm font-semibold w-fit animate-scaleIn">
                         <span>Excluir permanentemente este estudante e sua família?</span>
                         <button 
                           type="button" 
                           onClick={() => confirmDelete(editingStudentId)}
                           className="p-1 px-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                         >
                           Sim, Excluir
                         </button>
                         <button 
                           type="button" 
                           onClick={() => setDeletingStudentId(null)}
                           className="p-1 px-2.5 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
                         >
                           Cancelar
                         </button>
                       </div>
                     ) : (
                       <button 
                         type="button" 
                         onClick={() => setDeletingStudentId(editingStudentId)}
                         className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-150 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-sm"
                       >
                         <Trash2 className="w-4 h-4" />
                         Excluir Estudante
                       </button>
                     )}
                   </>
                 )}
               </div>

               <div className="flex gap-3">
                 <button 
                   type="button" 
                   onClick={resetForm}
                   className="cursor-pointer border border-slate-300 text-slate-700 font-medium py-2 px-6 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                 >
                   Cancelar
                 </button>
                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer text-sm font-semibold shadow-sm">
                   {editingStudentId ? 'Salvar Edição' : 'Salvar Cadastro'}
                 </button>
               </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4 animate-fadeIn">
          <div className="inline-flex p-3 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400">
            <Search className="w-8 h-8 text-slate-350" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-md font-semibold text-slate-700">Nenhum estudante selecionado</h3>
            <p className="text-sm text-slate-500">
              Digite o nome ou cidade no campo acima para carregar o cadastro, ou aperte no botão <strong>+ Cadastrar Novo Estudante</strong> para iniciar do zero.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
