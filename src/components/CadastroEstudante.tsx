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
      alert("Selecione o Edital correspondente, e insira o nome completo e município do estudante.");
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
      setSuccess('Ficha do estudante atualizada com sucesso!');
    } else {
      await addStudent(studentData);
      setSuccess('Ficha do estudante cadastrada com sucesso!');
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
    setSuccess('Inscrição do estudante e seu histórico excluídos com sucesso!');
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
      className={`border rounded p-1 text-xs font-semibold ${val === 'Completo' ? 'bg-green-50 text-green-700 border-green-200' : val === 'Incompleto' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : val === 'Não Enviou' ? 'bg-red-50 text-red-705 border-red-200' : 'bg-gray-50 text-gray-450 border-gray-200'}`}
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
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 tracking-tight">
              <Search className="w-5 h-5 text-blue-500 animate-pulse" />
              Gestão de Estudantes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Busque um estudante registrado para atualizar/consultar seu cadastro, ou crie uma nova ficha.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => {
              resetForm();
              setIsNewRegistration(true);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
              isNewRegistration && !editingStudentId
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : 'bg-indigo-600 hover:bg-indigo-750 hover:shadow text-white'
            }`}
          >
            Criar Novo Cadastro
          </button>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Pesquisar Estudante Registrado
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
            placeholder="Digite o nome do estudante..."
          />
        </div>
      </div>

      {success && (
        <div className="mx-0 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          <span className="font-semibold text-sm">{success}</span>
        </div>
      )}

      {/* Main Registration/Edit Form Card */}
      {(editingStudentId || isNewRegistration) ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-scaleIn">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <FilePenLine className="w-5 h-5 text-indigo-500" />
              <div>
                <h2 className="text-md font-bold text-slate-800">
                  {editingStudentId ? `Ficha Cadastral: ${name}` : 'Novo Cadastro de Estudante'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingStudentId ? 'Altere as informações abaixo e clique em Salvar.' : 'Anexos enviados pelo estudante.'}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={resetForm}
              className="p-1 px-3 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer"
            >
              Fechar Formulário
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Número do Edital</label>
                <EditalSelect 
                  editais={editais} 
                  value={edital} 
                  onChange={setEdital} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome do Estudante</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder=""
                  className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-medium" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Município</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  placeholder=""
                  className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-medium" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 border-b pb-2 flex items-center gap-2 uppercase tracking-wide">
                  <Info className="w-4 h-4 text-blue-500" /> Comprovações de Identificação
                </h3>
                {idDocs.map((doc, i) => {
                  const isNotApplicable = doc.status === 'Não se Aplica';
                  return (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-650 text-xs w-48">{doc.name}</span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <StatusSelect val={doc.status} onChange={(v) => handleDocChange('id', i, 'status', v)} />
                        <input 
                          type="text" 
                          placeholder="Obs / Qual?..." 
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
                <h3 className="text-xs font-bold text-slate-700 border-b pb-2 flex items-center gap-2 uppercase tracking-wide">
                  <Info className="w-4 h-4 text-emerald-500" /> Comprovações de Rendimentos
                </h3>
                {incomeDocs.map((doc, i) => {
                  const isNotApplicable = doc.status === 'Não se Aplica';
                  return (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-650 text-xs w-48">{doc.name}</span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <StatusSelect val={doc.status} onChange={(v) => handleDocChange('income', i, 'status', v)} />
                        <input 
                          type="text" 
                          placeholder="Obs / Qual?..." 
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
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Rendimento e Critérios de Pontuação do Edital</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                   <label className="block text-[11px] font-bold text-slate-600 mb-1 leading-normal">Renda Mensal Individual (R$)</label>
                   <input type="number" step="0.01" value={incomeValue} onChange={e => setIncomeValue(e.target.value)} placeholder="0.00" className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-semibold" />
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-slate-650 mb-1 leading-normal" title="Pontuação - Força de Estudo / Desempenho">Pontuação extra: FE</label>
                   <input type="number" value={scores.FE} onChange={e => setScores({...scores, FE: e.target.value})} placeholder="0" className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-semibold text-center" />
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-slate-650 mb-1 leading-normal" title="Pontuação - Renda Familiar">Pontuação extra: RF</label>
                   <input type="number" value={scores.RF} onChange={e => setScores({...scores, RF: e.target.value})} placeholder="0" className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-semibold text-center" />
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-slate-650 mb-1 leading-normal" title="Pontuação - Índice de Vulnerabilidade">Pontuação extra: IV</label>
                   <input type="number" value={scores.IV} onChange={e => setScores({...scores, IV: e.target.value})} placeholder="0" className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-semibold text-center" />
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-slate-650 mb-1 leading-normal" title="Pontuação - Fator de Ajuste">Pontuação extra: FA</label>
                   <input type="number" value={scores.FA} onChange={e => setScores({...scores, FA: e.target.value})} placeholder="0" className="w-full border-slate-300 rounded-lg shadow-sm border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-semibold text-center" />
                </div>
              </div>
              <p className="text-[10px] text-slate-450 mt-2">
                *Os campos de pontuação são atribuídos conforme análise, somando-se ao índice de renda.
              </p>
            </div>

            <div className="flex justify-between items-center gap-3 pt-6 border-t border-slate-200">
               <div className="flex-1">
                 {editingStudentId && (
                   <>
                     {deletingStudentId === editingStudentId ? (
                       <div className="flex items-center gap-2 bg-red-50 text-red-700 py-2 px-3.5 rounded-lg border border-red-200 text-xs font-semibold w-fit animate-scaleIn">
                         <span>Excluir permanentemente este estudante e todos os seus familiares vinculados?</span>
                         <button 
                           type="button" 
                           onClick={() => confirmDelete(editingStudentId)}
                           className="p-1 px-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                         >
                           Sim, Excluir Tudo
                         </button>
                         <button 
                           type="button" 
                           onClick={() => setDeletingStudentId(null)}
                           className="p-1 px-2.5 bg-white text-slate-705 text-xs font-semibold hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
                         >
                           Cancelar
                         </button>
                       </div>
                     ) : (
                       <button 
                         type="button" 
                         onClick={() => setDeletingStudentId(editingStudentId)}
                         className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-150 font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                       >
                         <Trash2 className="w-4 h-4" />
                         Excluir Estudante e Histórico
                       </button>
                     )}
                   </>
                 )}
               </div>

               <div className="flex gap-3">
                 <button 
                   type="button" 
                   onClick={resetForm}
                   className="cursor-pointer border border-slate-300 text-slate-705 font-semibold py-2 px-6 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                 >
                   Cancelar
                 </button>
                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors cursor-pointer text-xs shadow-sm">
                   {editingStudentId ? 'Salvar Alterações' : 'Confirmar e Cadastrar'}
                 </button>
               </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-250 p-12 text-center space-y-4 animate-fadeIn">
          <div className="inline-flex p-3 bg-white rounded-full shadow-sm border border-slate-100 text-slate-450 hover:shadow transition-shadow">
            <Search className="w-8 h-8 text-slate-350" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-slate-700">Abra ou encontre uma ficha cadastral</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Digite o nome ou cidade do estudante no campo correspondente para carregar seu formulário de avaliação completo, ou clique em <strong>Criar Novo Cadastro de Estudante</strong>. 
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
