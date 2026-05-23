import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Printer, Calendar, FileText } from 'lucide-react';
import { MINIMUM_WAGE } from '../constants';
import { StudentSelect } from './StudentSelect';

export function Relatorio() {
  const { state } = useAppContext();
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const student = state.students.find(s => s.id === selectedStudentId);
  const nucleus = state.nucleusMembers.filter(n => n.studentId === selectedStudentId);

  const getDocSummaryContext = (docs: any[]) => {
    const comp = docs.filter(d => d.status === 'Completo').map(d => d.name).join(', ');
    const inc = docs.filter(d => d.status === 'Incompleto').map(d => `${d.name} (${d.observation || 'sem obs'})`).join(', ');
    const nenv = docs.filter(d => d.status === 'Não Enviou').map(d => d.name).join(', ');
    return { comp, inc, nenv };
  };

  const familySize = nucleus.length + 1;
  const totalIncome = (student?.incomeValue || 0) + nucleus.reduce((acc, m) => acc + m.incomeValue, 0);
  const perCapita = totalIncome / familySize;
  let incomeScore = 0;
  if (perCapita <= MINIMUM_WAGE / 2) incomeScore = 30;
  else if (perCapita <= MINIMUM_WAGE) incomeScore = 20;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden no-print">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
           <h2 className="text-lg font-medium text-slate-800">Gerar Relatório Resumo</h2>
        </div>
        <div className="p-6 flex items-center gap-4">
          <div className="w-full max-w-md">
            <StudentSelect
              students={state.students}
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              placeholder="Selecione ou busque o estudante..."
            />
          </div>
          <button 
            disabled={!student}
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimir Parecer
          </button>
        </div>
      </div>

      {student && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print-container">
           <div className="p-8 space-y-8">
              <div className="text-center border-b pb-6">
                <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">Relatório Socioeconômico</h1>
                <p className="text-slate-500 mt-2">Documento de análise técnica para concessão de auxílio</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 border rounded-lg">
                 <div><strong className="block text-slate-500 text-xs mb-1">Estudante</strong> {student.name}</div>
                 <div><strong className="block text-slate-500 text-xs mb-1">Edital</strong> {student.edital || '-'}</div>
                 <div><strong className="block text-slate-500 text-xs mb-1">Cidade</strong> {student.city}</div>
                 <div><strong className="block text-slate-500 text-xs mb-1">Cadastro</strong> {new Date(student.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Documentação do Estudante</h3>
                <div className="text-sm space-y-2">
                   {(()=>{
                     const id = getDocSummaryContext(student.idDocs);
                     const inc = getDocSummaryContext(student.incomeDocs);
                     return (
                       <table className="w-full text-left border">
                         <tbody className="divide-y">
                           <tr><td className="p-2 font-medium bg-slate-50 w-1/3">ID Completos</td><td className="p-2">{id.comp || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-yellow-50 w-1/3">ID Incompletos</td><td className="p-2 text-yellow-800">{id.inc || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-red-50 w-1/3">ID Não Enviados</td><td className="p-2 text-red-800">{id.nenv || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-slate-50 w-1/3">Renda Completos</td><td className="p-2">{inc.comp || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-yellow-50 w-1/3">Renda Incompletos</td><td className="p-2 text-yellow-800">{inc.inc || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-red-50 w-1/3">Renda Não Enviados</td><td className="p-2 text-red-800">{inc.nenv || '-'}</td></tr>
                         </tbody>
                       </table>
                     );
                   })()}
                </div>
              </div>

              {nucleus.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">Documentação do Núcleo Familiar</h3>
                  {nucleus.map((member, i) => {
                    const id = getDocSummaryContext(member.idDocs);
                    const inc = getDocSummaryContext(member.incomeDocs);
                    return (
                      <div key={i} className="mb-4 text-sm border p-4 rounded-lg">
                        <strong className="block mb-2 text-slate-800 uppercase print:text-black">Parente: {member.name}</strong>
                        <table className="w-full text-left border">
                         <tbody className="divide-y">
                           <tr><td className="p-2 font-medium bg-slate-50 w-1/3">ID Completos</td><td className="p-2">{id.comp || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-yellow-50 w-1/3">ID Incompletos</td><td className="p-2 text-yellow-800">{id.inc || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-red-50 w-1/3">ID N. Enviados</td><td className="p-2 text-red-800">{id.nenv || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-slate-50 w-1/3">Renda Completos</td><td className="p-2">{inc.comp || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-yellow-50 w-1/3">Renda Incompletos</td><td className="p-2 text-yellow-800">{inc.inc || '-'}</td></tr>
                           <tr><td className="p-2 font-medium bg-red-50 w-1/3">Renda N. Enviados</td><td className="p-2 text-red-800">{inc.nenv || '-'}</td></tr>
                         </tbody>
                       </table>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Resumo de Indicadores Técnicos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium">
                  <div className="p-4 bg-slate-50 rounded text-center border">
                    <span className="block text-slate-500 mb-1 text-xs uppercase tracking-wider">Membros Núcleo</span>
                    <span className="text-xl">{familySize}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded text-center border">
                    <span className="block text-slate-500 mb-1 text-xs uppercase tracking-wider">Renda Per Capita</span>
                    <span className="text-xl">R$ {perCapita.toFixed(2)}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded text-center border">
                    <span className="block text-slate-500 mb-1 text-xs uppercase tracking-wider">Pontos (Renda)</span>
                    <span className="text-xl">{incomeScore}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded text-center border">
                    <span className="block text-slate-500 mb-1 text-xs uppercase tracking-wider">Pontos (Outros)</span>
                    <span className="text-xl">{student.scores.FE + student.scores.FA + student.scores.IV + student.scores.RF}</span>
                  </div>
                </div>
              </div>

              <div className="pt-16 mt-8 w-full flex flex-col items-center border-t border-slate-200 border-dashed text-slate-600">
                 <h2 className="text-xl font-bold uppercase mb-8 text-black print:text-black">Parecer da Avaliação:</h2>
                 <div className="h-0.5 bg-slate-400 w-64 mb-2"></div>
                 <p className="font-medium">Assistente Social __________________</p>
                 <p className="text-sm">CRESS: _____ / __</p>
                 <p className="text-sm mt-4">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                 <div className="mt-8 p-4 border rounded w-full h-32 italic text-slate-400 flex items-start justify-center text-sm">
                   (Espaço reservado para justificativa técnica)
                 </div>
              </div>

           </div>
        </div>
      )}
    </div>
  );
}
