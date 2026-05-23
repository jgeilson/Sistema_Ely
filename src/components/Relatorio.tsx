import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Printer, Calendar, FileText, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Users, Sparkles, Loader2, Edit3, ExternalLink } from 'lucide-react';
import { MINIMUM_WAGE } from '../constants';
import { StudentSelect } from './StudentSelect';

export function Relatorio() {
  const { state } = useAppContext();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [parecer, setParecer] = useState('');
  const [loadingParecer, setLoadingParecer] = useState(false);
  const [parecerError, setParecerError] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  React.useEffect(() => {
    setParecer('');
    setParecerError('');
  }, [selectedStudentId]);

  const student = state.students.find(s => s.id === selectedStudentId);
  const nucleus = state.nucleusMembers.filter(n => n.studentId === selectedStudentId);

  const getDocSummaryContext = (docs: any[]) => {
    const comp = docs.filter(d => d.status === 'Completo').map(d => d.name).join(', ');
    const inc = docs.filter(d => d.status === 'Incompleto').map(d => d.observation ? `${d.name} (${d.observation})` : d.name).join(', ');
    const nenv = docs.filter(d => d.status === 'Não Enviou').map(d => d.name).join(', ');
    return { comp, inc, nenv };
  };

  const familySize = nucleus.length + 1;
  const totalIncome = (student?.incomeValue || 0) + nucleus.reduce((acc, m) => acc + m.incomeValue, 0);
  const perCapita = totalIncome / familySize;
  let incomeScore = 0;
  if (perCapita <= MINIMUM_WAGE / 2) incomeScore = 30;
  else if (perCapita <= MINIMUM_WAGE) incomeScore = 20;

  const handleGenerateParecer = async () => {
    if (!student) return;
    setLoadingParecer(true);
    setParecerError('');
    try {
      const response = await fetch('/api/gemini/generate-parecer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student,
          nucleus,
          perCapita,
          familySize,
          totalIncome,
          incomeScore
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar a geração de parecer.');
      }
      setParecer(data.parecer);
    } catch (err: any) {
      console.error(err);
      setParecerError(err.message || 'Falha na comunicação para obter parecer da IA.');
    } finally {
      setLoadingParecer(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {isIframe && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-indigo-950 no-print animate-fadeIn shadow-sm">
          <div className="flex items-start gap-2.5">
            <Printer className="w-5 h-5 shrink-0 mt-0.5 text-indigo-600 animate-pulse" />
            <div>
              <h4 className="font-bold text-xs">Instrução para Impressão e PDF</h4>
              <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                Como você está no ambiente de visualização da plataforma, o navegador bloqueia a impressão dentro do painel. Clique ao lado para abrir o sistema em uma <strong>nova aba exclusiva</strong> e imprimir com sucesso!
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 relative z-30 no-print">
        <div className="border-b border-slate-200 bg-slate-50 rounded-t-xl px-6 py-4">
           <h2 className="text-lg font-bold text-slate-800 tracking-tight">Emissão do Parecer e Resumo de Análise Social</h2>
           <p className="text-xs text-slate-505 mt-0.5">Selecione o estudante para gerar a visualização.</p>
        </div>
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full max-w-md">
            <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Localizar Ficha do Estudante:</label>
            <StudentSelect
              students={state.students}
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              placeholder="Pesquise pelo nome ou cidade do estudante..."
            />
          </div>
          <button 
            disabled={!student}
            onClick={() => {
              if (isIframe) {
                setShowPrintModal(true);
              } else {
                window.print();
              }
            }}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm shadow-sm md:self-end md:mb-0.5 animate-pulse"
          >
            <Printer className="w-4 h-4" /> Imprimir Documento
          </button>
        </div>
      </div>

      {student ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print-container animate-scaleIn relative z-10">
           <div className="p-8 space-y-8">
              <div className="text-center border-b pb-6 space-y-2">
                <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900 border-2 border-slate-900 p-2 inline-block">RESUMO DE AVALIAÇÃO SOCIOECONÔMICA</h1>
                <p className="text-slate-550 font-medium text-sm">Documentos analisados para fins de deferimento de auxílios e/ou bolsas</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                 <div className="sm:col-span-9 bg-slate-50/60 p-4 border-l-4 border-indigo-500 rounded-r-xl shadow-sm flex flex-col justify-center">
                    <strong className="block text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Candidato / Estudante</strong>
                    <span className="font-extrabold text-slate-800 text-sm leading-tight uppercase">{student.name}</span>
                 </div>
                 <div className="sm:col-span-3 bg-slate-50/60 p-4 border-l-4 border-emerald-500 rounded-r-xl shadow-sm flex flex-col justify-center">
                    <strong className="block text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Processo / Edital</strong>
                    <span className="font-extrabold text-slate-800 text-sm leading-tight">{student.edital || '-'}</span>
                 </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b pb-2">
                  <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-700 no-print">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">1. Quadro de Validação Documental (Estudante)</h3>
                </div>
                
                {(() => {
                  const id = getDocSummaryContext(student.idDocs);
                  const inc = getDocSummaryContext(student.incomeDocs);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Identificação Column */}
                      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 mb-3.5">
                            <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
                              Documentos de Identificação
                            </span>
                          </div>
                          <div className="space-y-3.5">
                            {/* Completos */}
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <div className="space-y-0.5 flex-1">
                                <span className="block text-slate-400 font-bold uppercase tracking-wide text-[8.5px]">Completos / Validados</span>
                                <p className="text-slate-700 font-medium leading-relaxed">
                                  {id.comp || <span className="text-slate-300 font-normal italic">Nenhum</span>}
                                </p>
                              </div>
                            </div>
                            {/* Incompletos */}
                            {id.inc && (
                              <div className="flex items-start gap-2.5 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <div className="space-y-0.5 flex-1">
                                  <span className="block text-amber-800 font-bold uppercase tracking-wide text-[8.5px]">Incompletos / Pendentes</span>
                                  <p className="text-amber-900 font-medium leading-relaxed">{id.inc}</p>
                                </div>
                              </div>
                            )}
                            {/* Não Enviados */}
                            {id.nenv && (
                              <div className="flex items-start gap-2.5 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/60">
                                <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                <div className="space-y-0.5 flex-1">
                                  <span className="block text-rose-800 font-bold uppercase tracking-wide text-[8.5px]">Não Enviados</span>
                                  <p className="text-rose-900 font-medium leading-relaxed">{id.nenv}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {!id.inc && !id.nenv && id.comp && (
                          <div className="mt-4 text-emerald-700 bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-150 font-medium flex items-center gap-1.5 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Identificação 100% regularizada.
                          </div>
                        )}
                      </div>

                      {/* Rendimento Column */}
                      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 mb-3.5">
                            <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
                              Documentos de Renda / Rendimento
                            </span>
                          </div>
                          <div className="space-y-3.5">
                            {/* Completos */}
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <div className="space-y-0.5 flex-1">
                                <span className="block text-slate-400 font-bold uppercase tracking-wide text-[8.5px]">Completos / Validados</span>
                                <p className="text-slate-700 font-medium leading-relaxed">
                                  {inc.comp || <span className="text-slate-300 font-normal italic">Nenhum</span>}
                                </p>
                              </div>
                            </div>
                            {/* Incompletos */}
                            {inc.inc && (
                              <div className="flex items-start gap-2.5 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <div className="space-y-0.5 flex-1">
                                  <span className="block text-amber-800 font-bold uppercase tracking-wide text-[8.5px]">Incompletos / Pendentes</span>
                                  <p className="text-amber-900 font-medium leading-relaxed">{inc.inc}</p>
                                </div>
                              </div>
                            )}
                            {/* Não Enviados */}
                            {inc.nenv && (
                              <div className="flex items-start gap-2.5 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/60">
                                <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                <div className="space-y-0.5 flex-1">
                                  <span className="block text-rose-800 font-bold uppercase tracking-wide text-[8.5px]">Não Enviados</span>
                                  <p className="text-rose-900 font-medium leading-relaxed">{inc.nenv}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {!inc.inc && !inc.nenv && inc.comp && (
                          <div className="mt-4 text-emerald-700 bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-150 font-medium flex items-center gap-1.5 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Comprovações de renda 100% regularizadas.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {nucleus.length > 0 ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700 no-print">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">2. Verificação de Dependentes e Integrantes Família</h3>
                  </div>
                  
                  <div className="space-y-5">
                    {nucleus.map((member, i) => {
                      const id = getDocSummaryContext(member.idDocs);
                      const inc = getDocSummaryContext(member.incomeDocs);
                      return (
                        <div key={i} className="text-xs border border-slate-200 p-5 rounded-xl bg-white shadow-sm space-y-4">
                          <div className="flex items-center justify-between border-b pb-2.5">
                            <span className="font-extrabold text-[11px] text-slate-800 uppercase tracking-wide">
                              Integrante Familiar #{i + 1}: {member.name}
                            </span>
                            <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-600 font-bold uppercase text-[9px] tracking-wider">
                              Renda Mensal: R$ {member.incomeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Member Identificação Column */}
                            <div className="bg-slate-50/50 rounded-lg border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between">
                              <div>
                                <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block border-b border-slate-150 pb-1.5 mb-2.5">
                                  Documentos de Identificação
                                </span>
                                <div className="space-y-2.5">
                                  <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                    <div className="space-y-0.1">
                                      <span className="block text-slate-400 font-bold uppercase tracking-normal text-[8px]">Completos</span>
                                      <p className="text-slate-700 font-medium">{id.comp || <span className="text-slate-300 italic font-normal">Nenhum</span>}</p>
                                    </div>
                                  </div>
                                  {id.inc && (
                                    <div className="flex items-start gap-2 bg-amber-50/50 p-2 rounded border border-amber-200/40">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                      <div>
                                        <span className="block text-amber-800 font-bold uppercase tracking-normal text-[8px]">Incompletos</span>
                                        <p className="text-amber-905 font-medium">{id.inc}</p>
                                      </div>
                                    </div>
                                  )}
                                  {id.nenv && (
                                    <div className="flex items-start gap-2 bg-rose-50/50 p-2 rounded border border-rose-200/40">
                                      <XCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                                      <div>
                                        <span className="block text-rose-800 font-bold uppercase tracking-normal text-[8px]">Não Enviados</span>
                                        <p className="text-rose-905 font-medium">{id.nenv}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Member Rendimento Column */}
                            <div className="bg-slate-50/50 rounded-lg border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between">
                              <div>
                                <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block border-b border-slate-150 pb-1.5 mb-2.5">
                                  Documentos de Renda / Rendimento
                                </span>
                                <div className="space-y-2.5">
                                  <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                    <div className="space-y-0.1">
                                      <span className="block text-slate-400 font-bold uppercase tracking-normal text-[8px]">Completos</span>
                                      <p className="text-slate-700 font-medium">{inc.comp || <span className="text-slate-300 italic font-normal">Nenhum</span>}</p>
                                    </div>
                                  </div>
                                  {inc.inc && (
                                    <div className="flex items-start gap-2 bg-amber-50/50 p-2 rounded border border-amber-200/40">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                      <div>
                                        <span className="block text-amber-800 font-bold uppercase tracking-normal text-[8px]">Incompletos</span>
                                        <p className="text-amber-905 font-medium">{inc.inc}</p>
                                      </div>
                                    </div>
                                  )}
                                  {inc.nenv && (
                                    <div className="flex items-start gap-2 bg-rose-50/50 p-2 rounded border border-rose-200/40">
                                      <XCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                                      <div>
                                        <span className="block text-rose-800 font-bold uppercase tracking-normal text-[8px]">Não Enviados</span>
                                        <p className="text-rose-905 font-medium">{inc.nenv}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700 no-print">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">2. Verificação de Dependentes e Integrantes Família</h3>
                  </div>
                  <p className="text-xs text-slate-550 italic bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm leading-relaxed">
                    Nenhum familiar dependente foi associado no grupo familiar deste estudante. Considera-se domicílio unipessoal para fins avaliativos.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">3. Indicadores de Renda e Pontuações</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div className="p-4 bg-slate-50/50 rounded text-center border border-slate-200">
                    <span className="block text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Membros Domiciliares</span>
                    <span className="text-lg font-bold text-slate-800">{familySize} pessoa(s)</span>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded text-center border border-slate-200">
                    <span className="block text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Renda Per Capita Domicílios</span>
                    <span className="text-lg font-bold text-slate-800">R$ {perCapita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded text-center border border-slate-200">
                    <span className="block text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Pontuação de Renda</span>
                    <span className="text-lg font-bold text-slate-800">{incomeScore} Pts</span>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded text-center border border-slate-200">
                    <span className="block text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Pontuações Extras (FE+RF+IV+FA)</span>
                    <span className="text-lg font-bold text-slate-800">{student.scores.FE + student.scores.FA + student.scores.IV + student.scores.RF} Pts</span>
                  </div>
                </div>


              </div>

              <div className="pt-16 mt-8 w-full flex flex-col items-center border-t border-slate-200 border-dashed text-slate-650">
                 <h2 className="text-lg font-bold uppercase mb-8 text-black print:text-black">Resultado e Assinatura Técnica</h2>
                 <div className="h-0.5 bg-slate-400 w-64 mb-2"></div>
                 <p className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">ELINALDA JOSÉ GONÇALVES</p>
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Assistente Social / Responsável do Processo</p>
                 <p className="text-xs text-slate-700 mt-1 font-semibold bg-slate-50 px-3 py-1 rounded-md border border-slate-200 inline-block">
                   CRESS: 4759/PB &bull; Matrícula: 2423342
                 </p>
                 <p className="text-[10px] text-slate-400 mt-3">Emitido em {new Date().toLocaleDateString('pt-BR')}</p>
                 <div className="mt-8 w-full space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2 mb-2 no-print">
                      <strong className="text-slate-600 font-bold uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-slate-500" /> Parecer e Anotações da Análise
                      </strong>
                      <button
                        type="button"
                        disabled={loadingParecer || !student}
                        onClick={handleGenerateParecer}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] uppercase font-extrabold px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 inline-flex"
                      >
                        {loadingParecer ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando Parecer...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Elaborar Parecer com IA
                          </>
                        )}
                      </button>
                    </div>

                    {/* Print representation */}
                    <div className="hidden print-visible border border-slate-300 rounded-lg p-5 bg-slate-50/20 text-xs text-slate-800 leading-relaxed text-justify h-auto min-h-[140px] text-left">
                      <strong className="block text-slate-700 font-bold uppercase mb-2.5 tracking-wider text-[9px] border-b pb-1.5">
                        Parecer e Anotações da Análise
                      </strong>
                      {parecer ? (
                        <p className="whitespace-pre-wrap font-medium">{parecer}</p>
                      ) : (
                        <span className="text-slate-400 italic"></span>
                      )}
                    </div>

                    {/* Screen representation */}
                    <div className="no-print space-y-3">
                      {parecerError && (
                        <div className="bg-rose-50 border border-rose-200/60 p-3 rounded-lg text-rose-800 text-[11px] leading-snug flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Erro ao acionar o Gemini:</span>
                            <span>{parecerError}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="relative">
                        <strong className="block sm:hidden text-slate-600 font-semibold not-italic uppercase mb-1.5 tracking-wide text-[10px]/normal text-slate-500">Parecer e Anotações da Análise:</strong>
                        <textarea
                          id="gpt-parecer-textarea"
                          value={parecer}
                          onChange={(e) => setParecer(e.target.value)}
                          placeholder="Clique em 'Elaborar Parecer com IA' para um preenchimento via IA com base nos indicadores."
                          className="w-full h-36 p-3.5 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-slate-700 bg-slate-50/10 leading-relaxed resize-y shadow-inner transition-colors focus:outline-none"
                        />
                      </div>
                      
                      <div className="text-[10px] text-slate-400 italic flex items-center justify-between px-1 font-normal text-left">
                        <span>O texto pode ser editado antes da impressão.</span>
                        {parecer && <span>{parecer.length} caracteres</span>}
                      </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 text-center rounded-xl space-y-3">
          <div className="p-3 bg-white shadow rounded-full border w-fit mx-auto text-slate-400">
             <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-slate-700 font-bold text-sm">Selecione um Candidato</h3>
          <p className="text-xs text-slate-550 max-w-sm mx-auto">Após carregar o cadastro, o resumo estará preenchido com todos os dados salvos.</p>
        </div>
      )}

      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn no-print">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl relative animate-scaleIn">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Printer className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-slate-800">Visualizador Integrado (Iframe) Bloqueado</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Os navegadores modernos bloqueiam o recurso de impressão e gravação de PDF de dentro de páginas incorporadas (iframe) por segurança.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 text-xs text-slate-650 leading-relaxed space-y-2 text-left">
              <span className="font-extrabold text-slate-700 block uppercase tracking-wider text-[10px]">Como Imprimir/Gerar o PDF:</span>
              <p>
                1. Clique no botão de destaque abaixo para abrir o sistema em sua <strong>própria aba exclusiva</strong>.
              </p>
              <p>
                2. Na nova aba, selecione o candidato e clique em <strong>"Imprimir Documento"</strong> normalmente.
              </p>
              <p>
                3. A janela oficial de impressão/PDF do seu sistema operacional irá carregar perfeitamente e formatada em A4!
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
                Forçar no Iframe
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
