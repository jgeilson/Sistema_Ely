import React, { useState } from 'react';
import { createDefaultDocs, DEFAULT_ID_DOCS_STUDENT, DEFAULT_INCOME_DOCS_STUDENT } from '../constants';
import { DocStatus, Student } from '../types';
import { useAppContext } from '../context/AppContext';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export function CadastroEstudante() {
  const { addStudent } = useAppContext();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  
  const [idDocs, setIdDocs] = useState(createDefaultDocs(DEFAULT_ID_DOCS_STUDENT));
  const [incomeDocs, setIncomeDocs] = useState(createDefaultDocs(DEFAULT_INCOME_DOCS_STUDENT));
  
  const [incomeValue, setIncomeValue] = useState<number>(0);
  const [scores, setScores] = useState({ FE: 0, RF: 0, IV: 0, FA: 0 });
  const [success, setSuccess] = useState('');

  const handleDocChange = (type: 'id' | 'income', index: number, field: string, value: string) => {
    const list = type === 'id' ? [...idDocs] : [...incomeDocs];
    list[index] = { ...list[index], [field]: value };
    if (type === 'id') setIdDocs(list);
    else setIncomeDocs(list);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city) {
      alert("Nome e cidade são obrigatórios.");
      return;
    }

    const student: Student = {
      id: crypto.randomUUID(),
      name,
      city,
      idDocs,
      incomeDocs,
      incomeValue,
      scores,
      createdAt: new Date().toISOString()
    };

    addStudent(student);
    setSuccess('Estudante cadastrado com sucesso!');
    
    // Reset Form
    setName('');
    setCity('');
    setIdDocs(createDefaultDocs(DEFAULT_ID_DOCS_STUDENT));
    setIncomeDocs(createDefaultDocs(DEFAULT_INCOME_DOCS_STUDENT));
    setIncomeValue(0);
    setScores({ FE: 0, RF: 0, IV: 0, FA: 0 });
    
    setTimeout(() => setSuccess(''), 3000);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-medium text-slate-800">Novo Cadastro (Estudante)</h2>
          <p className="text-sm text-slate-500 mt-1">Insira os dados base e documentos do estudante.</p>
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
              {idDocs.map((doc, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-600 truncate w-48">{doc.name}</span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <StatusSelect val={doc.status} onChange={(v) => handleDocChange('id', i, 'status', v)} />
                    {doc.status === 'Incompleto' && (
                      <input type="text" placeholder="Obs..." value={doc.observation || ''} onChange={e => handleDocChange('id', i, 'observation', e.target.value)} className="border rounded p-1 w-24 text-xs" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium text-slate-800 border-b pb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Documentação de Renda</h3>
              {incomeDocs.map((doc, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm p-2 hover:bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-600 truncate w-48">{doc.name}</span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <StatusSelect val={doc.status} onChange={(v) => handleDocChange('income', i, 'status', v)} />
                    {doc.status === 'Incompleto' && (
                      <input type="text" placeholder="Obs..." value={doc.observation || ''} onChange={e => handleDocChange('income', i, 'observation', e.target.value)} className="border rounded p-1 w-24 text-xs" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-md font-medium text-slate-800 mb-4">Informações de Renda e Pontuação</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Renda Bruta (R$)</label>
                 <input type="number" step="0.01" value={incomeValue} onChange={e => setIncomeValue(Number(e.target.value))} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Pont. FE</label>
                 <input type="number" value={scores.FE} onChange={e => setScores({...scores, FE: Number(e.target.value)})} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Pont. RF</label>
                 <input type="number" value={scores.RF} onChange={e => setScores({...scores, RF: Number(e.target.value)})} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Pont. IV</label>
                 <input type="number" value={scores.IV} onChange={e => setScores({...scores, IV: Number(e.target.value)})} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Pont. FA</label>
                 <input type="number" value={scores.FA} onChange={e => setScores({...scores, FA: Number(e.target.value)})} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer">
               Salvar Cadastro
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
