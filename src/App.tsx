import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { CadastroEstudante } from './components/CadastroEstudante';
import { CadastroNucleo } from './components/CadastroNucleo';
import { Classificacao } from './components/Classificacao';
import { Relatorio } from './components/Relatorio';
import { Layers, GraduationCap, Users, FileBarChart, Trophy, Loader2, Key, AlertTriangle } from 'lucide-react';

function MainWorkspace() {
  const [activeTab, setActiveTab] = useState<'estudante' | 'nucleo' | 'relatorio' | 'classificacao'>('estudante');
  const { loading, configRequired, retryConnection, spreadsheetId } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Conectando ao Google Sheets (via API)...</p>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen no-print shadow-xl flex flex-col">
           <div className="p-6 border-b border-slate-800">
             <div className="flex items-center gap-3 text-white">
               <Layers className="w-6 h-6 text-indigo-400" />
               <h1 className="font-bold text-lg tracking-tight">AvaliaSócio</h1>
             </div>
             <p className="text-xs text-slate-500 mt-2">Painel de Assistência Social</p>
           </div>
           
           <nav className="p-4 space-y-2 flex-grow">
             <button
               onClick={() => setActiveTab('estudante')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'estudante' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
             >
               <GraduationCap className="w-5 h-5" /> Novo Estudante
             </button>
             <button
               onClick={() => setActiveTab('nucleo')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'nucleo' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
             >
               <Users className="w-5 h-5" /> Cadastrar Núcleo
             </button>
             <button
               onClick={() => setActiveTab('relatorio')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'relatorio' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
             >
               <FileBarChart className="w-5 h-5" /> Relatório / Parecer
             </button>
             <button
               onClick={() => setActiveTab('classificacao')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'classificacao' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
             >
               <Trophy className="w-5 h-5" /> Classificação Final
             </button>
           </nav>

           <div className="p-4 border-t border-slate-800">
             {spreadsheetId && (
               <a 
                 href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 rounded-lg text-xs font-medium hover:bg-green-900/50 transition-colors"
               >
                 Abrir Planilha
               </a>
             )}
           </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 relative overflow-y-auto">
           {configRequired && (
             <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3 text-yellow-800 no-print">
               <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" />
               <div className="w-full">
                 <h3 className="font-semibold text-sm">Integração do Google Sheets Ausente</h3>
                 <p className="text-sm mt-1 mb-3 pr-8">
                   O sistema rodará no modo local (temporário) pois as credenciais não foram configuradas.
                   Adicione <code>GOOGLE_CLIENT_EMAIL</code>, <code>GOOGLE_PRIVATE_KEY</code>, e <code>SPREADSHEET_ID</code> no menu "Settings / Secrets" na sua direita para salvar os dados permanentemente na nuvem.
                 </p>
                 <button onClick={retryConnection} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg font-medium transition-colors border border-yellow-300">
                   Recarregar Conexão API
                 </button>
               </div>
             </div>
           )}

           {activeTab === 'estudante' && <CadastroEstudante />}
           {activeTab === 'nucleo' && <CadastroNucleo />}
           {activeTab === 'classificacao' && <Classificacao />}
           {activeTab === 'relatorio' && <Relatorio />}
        </main>
      </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainWorkspace />
    </AppProvider>
  );
}

