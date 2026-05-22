import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MINIMUM_WAGE } from '../constants';
import { Download, Users, Briefcase, FileWarning, CheckCircle } from 'lucide-react';

export function Classificacao() {
  const { getClassifications } = useAppContext();
  
  const classifications = getClassifications();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-slate-800">Classificação Final</h2>
            <p className="text-sm text-slate-500 mt-1">Lista de estudantes deferidos e indeferidos ordenada por pontuação (Salário mínimo ref: R$ {MINIMUM_WAGE.toFixed(2)}).</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar / Imprimir
          </button>
        </div>

        <div className="overflow-x-auto print-visible">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-3 font-medium">Estudante</th>
                <th className="px-6 py-3 font-medium">Status / Motivo</th>
                <th className="px-6 py-3 font-medium text-center">Núcleo</th>
                <th className="px-6 py-3 font-medium text-right">Renda Per Capita</th>
                <th className="px-6 py-3 font-medium text-center">Pontuação Renda</th>
                <th className="px-6 py-3 font-medium text-center">Pontuação Outros</th>
                <th className="px-6 py-3 font-medium text-center text-lg font-bold text-slate-900 border-l border-slate-200">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhum estudante cadastrado para classificação.
                  </td>
                </tr>
              ) : classifications.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.student.name}</div>
                    <div className="text-xs text-slate-500">{item.student.city}</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'Deferido' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3.5 h-3.5" /> Deferido
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FileWarning className="w-3.5 h-3.5" /> Indeferido
                        </span>
                        <span className="text-xs text-red-600 max-w-xs">{item.reason}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      {item.familySize}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    <div className="flex items-center justify-end gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      R$ {item.perCapitaIncome.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">{item.incomeScore}</td>
                  <td className="px-6 py-4 text-center">
                    {item.student.scores.FE + item.student.scores.RF + item.student.scores.IV + item.student.scores.FA}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-lg text-blue-700 bg-blue-50/30 border-l border-slate-200">
                     {item.status === 'Deferido' ? item.totalScore : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
