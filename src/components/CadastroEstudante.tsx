import React, { useState } from 'react';
import { createDefaultDocs, DEFAULT_ID_DOCS_STUDENT, DEFAULT_INCOME_DOCS_STUDENT } from '../constants';
import { DocStatus, Student } from '../types';
import { useAppContext } from '../context/AppContext';
import { Check, Info, Trash2, X, Search, FilePenLine, Copy, Users } from 'lucide-react';
import { EditalSelect } from './EditalSelect';
import { StudentSelect } from './StudentSelect';

export function CadastroEstudante() {
  const { 
    state, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    getEditais, 
    addNucleusMember,
    setActiveTab,
    setSelectedStudentIdForNucleus
  } = useAppContext();
  const editais = getEditais();
  
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const currentStudent = state.students.find(s => s.id === editingStudentId);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [targetEdital, setTargetEdital] = useState('');

  const [edital, setEdital] = useState(editais.length > 0 ? editais[editais.length - 1] : '');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  
  const [idDocs, setIdDocs] = useState(createDefaultDocs(DEFAULT_ID_DOCS_STUDENT));
  const [incomeDocs, setIncomeDocs] = useState(createDefaultDocs(DEFAULT_INCOME_DOCS_STUDENT));
  
  const [incomeValue, setIncomeValue] = useState<string>('');
  const [scores, setScores] = useState({ FE: '', RF: '', IV: '', FA: '' });
  const [success, setSuccess] = useState('');
  const [redirectAfterSave, setRedirectAfterSave] = useState(false);

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

    const targetStudentId = editingStudentId || crypto.randomUUID();
    const activeUser = localStorage.getItem('auth_user') || 'Desconhecido';
    const originalStudent = editingStudentId ? state.students.find(st => st.id === editingStudentId) : null;

    const studentData: Student = {
      id: targetStudentId,
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
      createdAt: originalStudent ? originalStudent.createdAt : new Date().toISOString(),
      createdBy: originalStudent ? (originalStudent.createdBy || '') : activeUser,
      updatedBy: editingStudentId ? activeUser : '',
      updatedAt: editingStudentId ? new Date().toISOString() : ''
    };

    if (editingStudentId) {
      await updateStudent(studentData);
      setSuccess('Ficha do estudante atualizada com sucesso!');
    } else {
      await addStudent(studentData);
      setSuccess('Ficha do estudante cadastrada com sucesso!');
    }
    
    if (redirectAfterSave) {
      setSelectedStudentIdForNucleus(targetStudentId);
      setActiveTab('nucleo');
      setRedirectAfterSave(false);
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

  /**
   * COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB:
   * Esta função realiza o processo de duplicação total (deep clone) de um estudante e seus familiares
   * vinculados para um Edital de destino diferente. Usado para estudantes com inscrições múltiplas.
   * 
   * Características de portabilidade:
   * - Gera novos IDs RFC4122 (UUIDs) para todos os registros clonados para evitar colisões.
   * - Replica o grupo familiar de forma recursiva (um-para-muitos) mantendo a integridade referencial (studentId).
   * - Sincroniza individualmente com a fonte de dados (Google Sheets) via API REST e atualiza o estado cliente.
   */
  const handleDuplicate = async () => {
    if (!targetEdital.trim()) {
      alert("Por favor, digite ou selecione um Edital de destino válido.");
      return;
    }
    if (targetEdital === edital) {
      alert("O Edital de destino deve ser diferente do Edital atual.");
      return;
    }

    try {
      if (!currentStudent) {
        alert("Erro: Cadastro estudantil original não foi localizado!");
        return;
      }

      const newStudentId = crypto.randomUUID();
      const activeUser = localStorage.getItem('auth_user') || 'Desconhecido';
      
      // Duplicando o registro do estudante no novo Edital informado
      const duplicatedStudent: Student = {
        ...currentStudent,
        id: newStudentId,
        edital: targetEdital,
        createdAt: new Date().toISOString(),
        createdBy: activeUser,
        updatedBy: '',
        updatedAt: ''
      };

      await addStudent(duplicatedStudent);

      // Filtrando e duplicando os membros do núcleo familiar (grupo doméstico)
      const familyMembers = state.nucleusMembers.filter(m => m.studentId === editingStudentId);
      for (const member of familyMembers) {
        const duplicatedMember = {
          ...member,
          id: crypto.randomUUID(),
          studentId: newStudentId
        };
        await addNucleusMember(duplicatedMember);
      }

      setSuccess(`Duplicação efetuada! Estudante e ${familyMembers.length} familiares migrados para o "${targetEdital}".`);
      
      // Mantém o usuário visualizando o registro que acabou de ser clonado no novo Edital
      setEditingStudentId(newStudentId);
      setEdital(targetEdital);
      setDuplicating(false);
      setTargetEdital('');
      
      setTimeout(() => setSuccess(''), 4500);
    } catch (error) {
      console.error("Erro durante a clonagem de registros:", error);
      alert("Houve uma falha na replicação do prontuário.");
    }
  };

  const resetForm = () => {
    setEditingStudentId(null);
    setIsNewRegistration(false);
    setDeletingStudentId(null);
    setDuplicating(false);
    setTargetEdital('');
    setName('');
    setCity('');
    setIdDocs(createDefaultDocs(DEFAULT_ID_DOCS_STUDENT));
    setIncomeDocs(createDefaultDocs(DEFAULT_INCOME_DOCS_STUDENT));
    setIncomeValue('');
    setScores({ FE: '', RF: '', IV: '', FA: '' });
  };

  /* 
   * COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB:
   * StatusSelect estilizado com seletor nativo aprimorado para fornecer dicas visuais 
   * automáticas baseadas em contraste de cor adequado e bordas arredondadas.
   */
  const StatusSelect = ({ val, onChange }: { val: DocStatus, onChange: (v: string) => void }) => (
    <select 
      value={val} 
      onChange={(e) => onChange(e.target.value)}
      className={`border text-[11px] font-semibold rounded-lg px-2 py-1.5 transition-all outline-none focus:ring-2 cursor-pointer ${
        val === 'Completo' 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-250 focus:ring-emerald-200' 
          : val === 'Incompleto' 
          ? 'bg-amber-50 text-amber-705 border-amber-250 focus:ring-amber-200' 
          : val === 'Não Enviou' 
          ? 'bg-rose-50 text-rose-705 border-rose-250 focus:ring-rose-200' 
          : 'bg-slate-50 text-slate-500 border-slate-200 focus:ring-slate-200'
      }`}
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
                <div className="text-xs text-slate-500 mt-0.5 space-y-0.5 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  {editingStudentId ? (
                    <>
                      <span>Altere as informações abaixo e clique em Salvar.</span>
                      {currentStudent?.createdBy && (
                        <span className="text-indigo-600 font-medium">
                          • Criado por: <strong className="font-bold text-indigo-700">{currentStudent.createdBy}</strong>
                        </span>
                      )}
                      {currentStudent?.updatedBy && (
                        <span className="text-amber-600 font-medium">
                          • Editado por: <strong className="font-bold text-amber-700">{currentStudent.updatedBy}</strong>
                          {currentStudent.updatedAt && ` em ${new Date(currentStudent.updatedAt).toLocaleString('pt-BR')}`}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>Anexos enviados pelo estudante.</span>
                  )}
                </div>
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
            {/* COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB: Campo de dados principais estruturados com bordas refinadas e efeitos de focar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Número do Edital</label>
                <EditalSelect 
                  editais={editais} 
                  value={edital} 
                  onChange={setEdital} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome do Estudante</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Nome completo do candidato"
                  className="w-full border-slate-200 hover:border-slate-350 rounded-xl shadow-sm border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 font-semibold transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Município de Residência</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  placeholder="Ex: João Pessoa/PB"
                  className="w-full border-slate-200 hover:border-slate-350 rounded-xl shadow-sm border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 font-semibold transition-all" 
                  required 
                />
              </div>
            </div>

            {/* 
              * CONFIGURAÇÃO DE LAYOUT E PARÂMETROS DE ESTILO (DOCUMENTOS COMPLICAÇÕES):
              * - O container externo abaixo possui duas colunas em telas grandes (lg:grid-cols-2) com espaçamento generoso (gap-8).
              * - Modifique 'gap-8' para aumentar ou diminuir o espaço entre a coluna de identificação e rendimentos.
              * - Cada lista de documentos possui scroll interno vertical limitado (max-h-[380px] overflow-y-auto) para prezar pela densidade de informação.
              */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 border-b border-slate-150 pb-2 flex items-center gap-2 uppercase tracking-widest">
                  <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
                  Comprovações de Identificação
                </h3>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {idDocs.map((doc, i) => {
                    const isNotApplicable = doc.status === 'Não se Aplica';
                    
                    /* 
                     * MAPEAMENTO DE CORES E BORDAS SELECIONADAS POR STATUS:
                     * - 'Completo' -> Borda verde (emerald) esquerda de 4px, fundo verde claro translúcido.
                     * - 'Incompleto' -> Borda amarela (amber) esquerda de 4px, fundo amarelo translúcido.
                     * - 'Não Enviou' -> Borda vermelha (rose) esquerda de 4px, fundo vermelho translúcido.
                     * - 'Não se Aplica' -> Borda cinza suave esquerda, fundo fosco e texto cinza-médio desativado.
                     * modifique as cores de fundo, texto ou classes de hover (ex: hover:bg-emerald-50/20) para ajustar o design do status específico.
                     */
                    const activeBorderClasses: Record<DocStatus, string> = {
                      'Completo': 'border-l-4 border-l-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20 border-slate-150',
                      'Incompleto': 'border-l-4 border-l-amber-500 bg-amber-50/10 hover:bg-amber-50/20 border-slate-150',
                      'Não Enviou': 'border-l-4 border-l-rose-500 bg-rose-50/10 hover:bg-rose-50/20 border-slate-150',
                      'Não se Aplica': 'border-l-4 border-l-slate-300 bg-slate-50/30 text-slate-400 border-slate-150'
                    };
                    const colorClass = activeBorderClasses[doc.status] || 'bg-white';

                    return (
                      /*
                       * ESTRUTURA DO CARD ADAPTATIVO:
                       * - possui efeito de transição rápido (duration-200) e leve escala no hover de desktop (md:hover:scale-[1.002]).
                       * - Flex-col para garantir que em qualquer resolução ou orientação de celular o conteúdo se aninhe perfeitamente.
                       */
                      <div key={i} className={`flex flex-col gap-2.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-xs md:hover:scale-[1.002] ${colorClass}`}>
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-700 text-[11px] leading-tight select-none">
                            {doc.name}
                          </span>
                        </div>
                        {/* 
                          * GRADE INTERNA DO CARD (GRID COLS-12):
                          * - col-span-12: Garante que o seletor de status e o campo de observações ocupem toda a largura em telas pequenas (mobile).
                          * - sm:col-span-5 e sm:col-span-7: Distribui dinamicamente em proporção de 5/12 para o status e 7/12 para observações em telas médias/desktop.
                          * - Altere a relação sm:col-span-5/7 para customizar a largura mútua das entradas.
                          */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-12 sm:col-span-5">
                            <StatusSelect val={doc.status} onChange={(v) => handleDocChange('id', i, 'status', v)} />
                          </div>
                          <div className="col-span-12 sm:col-span-7">
                            <input 
                              type="text" 
                              placeholder="Adicionar nota..." 
                              value={doc.observation || ''} 
                              onChange={e => handleDocChange('id', i, 'observation', e.target.value)} 
                              disabled={isNotApplicable} 
                              className="w-full border-slate-200 bg-white hover:border-slate-300 shadow-sm border rounded-lg py-1 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-150 transition-all font-semibold text-slate-700" 
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 border-b border-slate-150 pb-2 flex items-center gap-2 uppercase tracking-widest">
                  <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full"></span>
                  Comprovações de Rendimentos
                </h3>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {incomeDocs.map((doc, i) => {
                    const isNotApplicable = doc.status === 'Não se Aplica';
                    
                    /* 
                     * MAPEAMENTO DE CORES E BORDAS SELECIONADAS POR STATUS (FINANCEIRO):
                     * - Mesma estrutura adaptativa de cores compartilhada da identificação.
                     */
                    const activeBorderClasses: Record<DocStatus, string> = {
                      'Completo': 'border-l-4 border-l-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20 border-slate-150',
                      'Incompleto': 'border-l-4 border-l-amber-500 bg-amber-50/10 hover:bg-amber-50/20 border-slate-150',
                      'Não Enviou': 'border-l-4 border-l-rose-500 bg-rose-50/10 hover:bg-rose-50/20 border-slate-150',
                      'Não se Aplica': 'border-l-4 border-l-slate-300 bg-slate-50/30 text-slate-400 border-slate-150'
                    };
                    const colorClass = activeBorderClasses[doc.status] || 'bg-white';

                    return (
                      <div key={i} className={`flex flex-col gap-2.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-xs md:hover:scale-[1.002] ${colorClass}`}>
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-700 text-[11px] leading-tight select-none">
                            {doc.name}
                          </span>
                        </div>
                        {/* 
                          * GRADE INTERNA DO CARD DE DOCUMENTAÇÃO DE RENDIMENTO:
                          * - Grid responsiva de 12 colunas para manter harmonia impecável (evitando quebras de linhas desorganizadas).
                          * - 'StatusSelect' ocupa col-span-5 e o input ocupa col-span-7 a partir do breakpoint 'sm'.
                          */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-12 sm:col-span-5">
                            <StatusSelect val={doc.status} onChange={(v) => handleDocChange('income', i, 'status', v)} />
                          </div>
                          <div className="col-span-12 sm:col-span-7">
                            <input 
                              type="text" 
                              placeholder="Adicionar nota..." 
                              value={doc.observation || ''} 
                              onChange={e => handleDocChange('income', i, 'observation', e.target.value)} 
                              disabled={isNotApplicable} 
                              className="w-full border-slate-200 bg-white hover:border-slate-300 shadow-sm border rounded-lg py-1 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-150 transition-all font-semibold text-slate-700" 
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB: Blocos individuais parametrizados (KPI Cards) para cálculo do índice de vulnerabilidade e renda extra do edital */}
            <div className="border-t border-slate-250 pt-6">
              <h3 className="text-xs font-bold text-slate-705 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-indigo-550 rounded-full"></span>
                Rendimento e Critérios de Pontuação do Edital
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/85 hover:border-slate-300 transition-colors shadow-xs">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Renda Nominal</span>
                   </div>
                   <label className="block text-xs font-bold text-slate-700 leading-normal mb-2">Renda Mensal (R$)</label>
                   <div className="relative">
                     <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                     <input 
                       type="number" 
                       step="0.01" 
                       value={incomeValue} 
                       onChange={e => setIncomeValue(e.target.value)} 
                       placeholder="0.00" 
                       className="w-full border-slate-200 hover:border-slate-300 rounded-xl shadow-xs border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-indigo-500 font-bold text-slate-800 transition-all" 
                     />
                   </div>
                </div>

                <div className="bg-blue-50/15 p-4 rounded-2xl border border-blue-100 hover:border-blue-200 transition-colors shadow-xs">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[9px] font-bold text-blue-550 uppercase tracking-widest">Critério</span>
                     <span className="bg-blue-100/60 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full" title="Formação Escolar">FE</span>
                   </div>
                   <label className="block text-xs font-bold text-slate-700 leading-normal mb-2" title="Formação Escolar (se estudou em escola pública ou não)">Formação Escolar</label>
                   <input 
                     type="number" 
                     value={scores.FE} 
                     onChange={e => setScores({...scores, FE: e.target.value})} 
                     placeholder="0" 
                     className="w-full border-slate-200 hover:border-slate-300 bg-white focus:bg-white rounded-xl shadow-xs border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-bold text-center text-slate-800 transition-all" 
                   />
                </div>

                <div className="bg-emerald-50/15 p-4 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-colors shadow-xs">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Critério</span>
                     <span className="bg-emerald-105/65 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full" title="Componente Familiar">RF</span>
                   </div>
                   <label className="block text-xs font-bold text-slate-705 leading-normal mb-2" title="Critério de pontuação familiar">Componente Familiar</label>
                   <input 
                     type="number" 
                     value={scores.RF} 
                     onChange={e => setScores({...scores, RF: e.target.value})} 
                     placeholder="0" 
                     className="w-full border-slate-200 hover:border-slate-300 bg-white focus:bg-white rounded-xl shadow-xs border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 font-bold text-center text-slate-800 transition-all" 
                   />
                </div>

                <div className="bg-amber-50/15 p-4 rounded-2xl border border-amber-100/70 hover:border-amber-250 transition-colors shadow-xs">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Critério</span>
                     <span className="bg-amber-100/60 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full" title="Índice de Vulnerabilidade">IV</span>
                   </div>
                   <label className="block text-xs font-bold text-slate-700 leading-normal mb-2" title="Pontuação - Índice de Vulnerabilidade">Vulnerabilidade (IV)</label>
                   <input 
                     type="number" 
                     value={scores.IV} 
                     onChange={e => setScores({...scores, IV: e.target.value})} 
                     placeholder="0" 
                     className="w-full border-slate-200 hover:border-slate-300 bg-white focus:bg-white rounded-xl shadow-xs border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-55 focus:border-amber-500 font-bold text-center text-slate-800 transition-all" 
                   />
                </div>

                <div className="bg-purple-50/15 p-4 rounded-2xl border border-purple-100 hover:border-purple-200 transition-colors shadow-xs">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">Critério</span>
                     <span className="bg-purple-100/60 text-purple-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full" title="Fator de Auxílio">FA</span>
                   </div>
                   <label className="block text-xs font-bold text-slate-700 leading-normal mb-2" title="Fator de Auxílio (se já possui ou não outro auxílio ativo)">Fator de Auxílio (FA)</label>
                   <input 
                     type="number" 
                     value={scores.FA} 
                     onChange={e => setScores({...scores, FA: e.target.value})} 
                     placeholder="0" 
                     className="w-full border-slate-200 hover:border-slate-300 bg-white focus:bg-white rounded-xl shadow-xs border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-105 focus:border-purple-500 font-bold text-center text-slate-800 transition-all" 
                   />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">
                *Os campos de pontuação (FE, RF, IV, FA) são atribuídos facultatively pela comissão avaliadora e incidem sobre a nota de classificação global.
              </p>
            </div>

             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
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

                      {/* COMENTÁRIOS DE EXPORTAÇÃO PARA GITHUB: Painel flutuante de duplicação do cadastro para novo edital */}
                      {duplicating ? (
                        <div className="flex flex-col sm:flex-row items-end gap-2 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs font-semibold w-full max-w-sm animate-scaleIn">
                          <div className="w-full">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">Edital de Destino</label>
                            <EditalSelect editais={editais} value={targetEdital} onChange={setTargetEdital} placeholder="Ex: Edital 02/2026" />
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button 
                              type="button" 
                              onClick={handleDuplicate}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                            >
                              Confirmar Cópia
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setDuplicating(false); setTargetEdital(''); }}
                              className="px-3 py-2 bg-white text-slate-700 text-[11px] font-bold hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => { setDuplicating(true); setTargetEdital(''); }}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-150 font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs inline-flex"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicar para outro Edital
                        </button>
                      )}
                    </>
                  )}
                </div>
 
                <div className="flex flex-wrap gap-3 shrink-0 w-full sm:w-auto justify-end">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="cursor-pointer border border-slate-300 text-slate-705 font-semibold py-2 px-6 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                  >
                    Cancelar
                  </button>

                  <button 
                    type="submit" 
                    onClick={() => setRedirectAfterSave(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg hover:shadow transition-all group cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Users className="w-4 h-4 transition-transform group-hover:scale-110" />
                    {editingStudentId ? 'Salvar e Ir para Família' : 'Salvar e Ir para Grupo Familiar'}
                  </button>

                  <button 
                    type="submit" 
                    onClick={() => setRedirectAfterSave(false)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors cursor-pointer text-xs shadow-sm"
                  >
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
