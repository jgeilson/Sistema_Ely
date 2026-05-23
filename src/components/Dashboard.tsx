import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { MINIMUM_WAGE } from '../constants';

const COLORS = ['#10b981', '#ef4444']; // emerald green and red-500

export function Dashboard() {
  const { getClassifications, getEditais } = useAppContext();
  const [selectedEdital, setSelectedEdital] = useState<string>('Todos');
  
  const editais = getEditais();
  const allClassifications = getClassifications();
  
  const classifications = useMemo(() => {
    if (selectedEdital === 'Todos') return allClassifications;
    return allClassifications.filter(c => c.student.edital === selectedEdital);
  }, [allClassifications, selectedEdital]);

  const stats = useMemo(() => {
    let deferidos = 0;
    let indeferidos = 0;
    let totalIncome = 0;
    
    classifications.forEach(item => {
      if (item.status === 'Deferido') deferidos++;
      else indeferidos++;
      
      totalIncome += item.perCapitaIncome;
    });
    
    return {
      total: classifications.length,
      deferidos,
      indeferidos,
      avgPerCapita: classifications.length > 0 ? (totalIncome / classifications.length) : 0,
    };
  }, [classifications]);

  const pieData = [
    { name: 'Deferidas (Aprovadas)', value: stats.deferidos },
    { name: 'Indeferidas (Pendências/Não atende)', value: stats.indeferidos },
  ];

  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    classifications.forEach(c => {
      let city = c.student.city || 'Não especificado';
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, amount: counts[k] }));
  }, [classifications]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Painel de Controle</h2>
          <p className="text-sm text-slate-500">Estatísticas dos editais analisados no sistema.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl flex items-center px-4 py-2 shadow-sm shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2.5">Filtrar Edital:</span>
          <select 
            value={selectedEdital}
            onChange={(e) => setSelectedEdital(e.target.value)}
            className="bg-transparent border-none text-sm text-slate-800 focus:outline-none focus:ring-0 font-semibold cursor-pointer"
          >
            <option value="Todos">Exibir Todos os Editais</option>
            {editais.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-450">Estudantes Avaliados</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-455">Estudantes Deferidos</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.deferidos}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-rose-50 p-3 rounded-xl text-rose-650 border border-rose-100">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-455">Estudantes Indeferidos</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.indeferidos}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-violet-50 p-3 rounded-xl text-violet-600 border border-violet-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-455">Renda Média Per Capita</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              R$ {stats.avgPerCapita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {stats.total > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-805 text-md mb-6 uppercase tracking-wider text-xs text-slate-450 border-b pb-3">Situação das Análises (Aprovação)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} estudante(s)`, 'Quantidade']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-805 text-md mb-6 uppercase tracking-wider text-xs text-slate-450 border-b pb-3">Distribuição Demográfica (Município/Bairro)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <Tooltip wrapperStyle={{ outline: 'none' }} cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} name="Inscrições" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
          Nenhum dado consolidado com os filtros selecionados.
        </div>
      )}
    </div>
  );
}
