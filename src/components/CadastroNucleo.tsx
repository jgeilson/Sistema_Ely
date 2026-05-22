import React, { useState } from 'react';
import { createDefaultDocs, DEFAULT_ID_DOCS_NUCLEUS, DEFAULT_INCOME_DOCS_NUCLEUS } from '../constants';
import { DocStatus, NucleusMember } from '../types';
import { useAppContext } from '../context/AppContext';
import { Check, Info } from 'lucide-react';

export function CadastroNucleo() {
  const { state, addNucleusMember } = useAppContext();
  
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !name) {
      alert("Selecione um estudante e insira o nome do parente.");
      return;
    }

    const member: NucleusMember = {
      id: crypto.randomUUID(),
      studentId,
      name,
      idDocs,
      incomeDocs,
      incomeValue,
    };

    addNucleusMember(member);
    setSuccess('Parente cadastrado com sucesso!');
    
    // Reset Form (keep student selected)
    setName('');
    setIdDocs(createDefaultDocs(DEFAULT_ID_DOCS_NUCLEUS));
    setIncomeDocs(createDefaultDocs(DEFAULT_INCOME_DOCS_NUCLEUS));
    setIncomeValue(0);
    
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
          <h2 className="text-lg font-medium text-slate-800">Núcleo Familiar</h2>
          <p className="text-sm text-slate-500 mt-1">Vincule familiares a um estudante cadastrado.</p>
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
              <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800" required>
                <option value="">Selecione o estudante...</option>
                {state.students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Familiar</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" required />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-md font-medium text-slate-800 border-b pb-2 flex items-center gap-2"><Info className="w-4 h-4" /> ID (Núcleo)</h3>
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
              <h3 className="text-md font-medium text-slate-800 border-b pb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Renda (Núcleo)</h3>
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
            <div className="max-w-xs">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Renda Bruta Pessoal (R$)</label>
                 <input type="number" step="0.01" value={incomeValue} onChange={e => setIncomeValue(Number(e.target.value))} className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer">
               Salvar Familiar
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
