import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { MINIMUM_WAGE } from '../constants';
import { Download, Users, Briefcase, FileWarning, CheckCircle, Search, Filter, Printer, ExternalLink, XCircle } from 'lucide-react';

export function Classificacao() {
  const { getClassifications, getEditais } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Deferido' | 'Indeferido'>('Todos');
  const [selectedEdital, setSelectedEdital] = useState<string>('Todos');
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  
  const editais = getEditais();
  const classifications = getClassifications();

  const filteredClassifications = useMemo(() => {
    return classifications.filter(c => {
      const matchName = c.student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'Todos' || c.status === filterStatus;
      const matchEdital = selectedEdital === 'Todos' || c.student.edital === selectedEdital;
      return matchName && matchStatus && matchEdital;
    });
  }, [classifications, searchTerm, filterStatus, selectedEdital]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {isIframe && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-indigo-950 no-print animate-fadeIn shadow-sm">
          <div className="flex items-start gap-2.5">
            <Printer className="w-5 h-5 shrink-0 mt-0.5 text-indigo-600 animate-pulse" />
            <div>
              <h4 className="font-bold text-xs">Instrução para Impressão e PDF</h4>
              <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                Como você está no ambiente de visualização da plataforma, o navegador bloqueia a exportação direta/impressão em PDF dentro do painel. Clique ao lado para abrir na <strong>nova aba exclusiva</strong> e exportar perfeitamente!
              </p>
            </div>
          </div>
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-indigo-600/10 shrink-0 cursor-pointer"
          >
            Abrir em Nova Aba <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Lista de Classificação e Resultados</h2>
            <p className="text-xs text-slate-500 mt-1">
              Lista ordenada decrescentemente por pontuação socioeconômica acumulada (Salário Mínimo Ref: R$ {MINIMUM_WAGE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 no-print">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar estudante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-505 focus:border-indigo-500 bg-white placeholder-slate-400 text-slate-700 w-full sm:w-56 text-xs font-medium"
              />
            </div>
            
            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
               <select
                 value={selectedEdital}
                 onChange={(e) => setSelectedEdital(e.target.value)}
                 className="px-3 py-2 text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 font-semibold cursor-pointer"
               >
                 <option value="Todos">Todos os Editais</option>
                 {editais.map(e => <option key={e} value={e}>{e}</option>)}
               </select>
            </div>

            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
               <div className="pl-3 pr-1 py-2 text-slate-400 hidden sm:block">
                 <Filter className="w-3.5 h-3.5" />
               </div>
               <select
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value as any)}
                 className="px-3 py-2 text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
               >
                 <option value="Todos">Filtrar Situação (Todos)</option>
                 <option value="Deferido">Apenas Deferidos</option>
                 <option value="Indeferido">Apenas Indeferidos</option>
               </select>
            </div>

            <button 
              onClick={() => {
                if (isIframe) {
                  setShowPrintModal(true);
                } else {
                  window.print();
                }
              }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 hover:shadow-sm text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer animate-pulse"
            >
              <Download className="w-3.5 h-3.5" /> Exportar / Imprimir
            </button>
          </div>
        </div>

        {/* Legend of Scoring acronyms */}
        <div className="bg-slate-100/60 px-6 py-2 border-b border-slate-200/60 flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          <span>Critérios de Pontuação:</span>
          <span>FE = Desempenho / Estudo</span>
          <span>RF = Renda Familiar</span>
          <span>IV = Vulnerabilidade Social</span>
          <span>FA = Fator Ajuste / Social</span>
        </div>

        <div className="overflow-x-auto print-visible">
          <table className="w-full text-left text-sm text-slate-650">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-bold">Estudante / Origem</th>
                <th className="px-6 py-3.5 font-bold">Situação da Inscrição</th>
                <th className="px-6 py-3.5 font-bold text-center">Grupo Familiar</th>
                <th className="px-6 py-3.5 font-bold text-right">Renda Per Capita</th>
                <th className="px-6 py-3.5 font-bold text-center">Score Renda (Pts)</th>
                <th className="px-6 py-3.5 font-bold text-center border-r border-slate-150">Scores Outros (FE+RF+IV+FA)</th>
                <th className="px-6 py-3.5 font-bold text-center text-slate-900 bg-indigo-50/50">Pontuação Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClassifications.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
                     Nenhum registro de estudante encontrado para os parâmetros selecionados.
                   </td>
                </tr>
              ) : filteredClassifications.map((item, idx) => {
                const rawOtherPoints = item.student.scores.FE + item.student.scores.RF + item.student.scores.IV + item.student.scores.FA;
                return (
                  <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.student.name}</div>
                      <div className="text-xs text-slate-450 mt-0.5 flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">{item.student.edital}</span>
                        <span>•</span>
                        <span>{item.student.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'Deferido' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Deferido
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <FileWarning className="w-3.5 h-3.5 text-red-500" /> Indeferido
                          </span>
                          <span className="text-[11px] text-red-650 max-w-xs font-medium bg-red-50/50 px-1.5 py-0.5 rounded border border-red-100">{item.reason}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-700 font-semibold">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        {item.familySize} <span className="text-xs text-slate-400 font-normal">pes.</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">
                      <div className="flex items-center justify-end gap-1.5">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        R$ {item.perCapitaIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{item.incomeScore}</td>
                    <td className="px-6 py-4 text-center text-xs text-slate-600 border-r border-slate-150">
                      <div className="font-semibold">{rawOtherPoints}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        FE:{item.student.scores.FE} • RF:{item.student.scores.RF} • IV:{item.student.scores.IV} • FA:{item.student.scores.FA}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-base text-indigo-700 bg-indigo-50/20">
                       {item.status === 'Deferido' ? `${item.totalScore} Pts` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn no-print">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl relative animate-scaleIn">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Printer className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-slate-800">Exportação Bloqueada pelo Iframe</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Os navegadores modernos bloqueiam recursos de salvamento ou impressão direta de arquivos PDF de dentro de páginas integradas (iframe) por segurança.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 text-xs text-slate-650 leading-relaxed space-y-2 text-left">
              <span className="font-extrabold text-slate-700 block uppercase tracking-wider text-[10px]">Passo a Passo para Exportar/Imprimir:</span>
              <p>
                1. Clique abaixo para abrir o painel de classificação em uma <strong>nova aba exclusiva</strong>.
              </p>
              <p>
                2. Na nova aba exclusiva, clique no botão <strong>"Exportar / Imprimir"</strong> no topo direito.
              </p>
              <p>
                3. A visualização de impressão/PDF da lista de classificação A4 abrirá perfeitamente!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-5 rounded-xl uppercase text-xs tracking-wider transition-all shadow-md shadow-indigo-600/10 cursor-pointer text-center"
              >
                Abrir em Nova Aba <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setShowPrintModal(false);
                  try {
                    window.print();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Tentar Forçar
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 animate-pulse" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
