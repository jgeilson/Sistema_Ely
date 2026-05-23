import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { MINIMUM_WAGE } from '../constants';

const COLORS = ['#22c55e', '#ef4444']; // verde e vermelho

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
    { name: 'Deferidos', value: stats.deferidos },
    { name: 'Indeferidos', value: stats.indeferidos },
  ];

  // Agrupamento por bairro/cidade (exemplo simples usando a city que vem do student)
  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    classifications.forEach(c => {
      let city = c.student.city || 'Não informada';
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, amount: counts[k] }));
  }, [classifications]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <div className="bg-white border border-slate-200 rounded-lg flex items-center px-3 py-2 shadow-sm">
          <span className="text-sm font-medium text-slate-500 mr-2">Edital:</span>
          <select 
            value={selectedEdital}
            onChange={(e) => setSelectedEdital(e.target.value)}
            className="bg-transparent border-none text-sm text-slate-800 focus:outline-none focus:ring-0 font-medium"
          >
            <option value="Todos">Todos os Editais</option>
            {editais.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Avaliados</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Deferidos</p>
            <p className="text-2xl font-bold text-slate-800">{stats.deferidos}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Indeferidos</p>
            <p className="text-2xl font-bold text-slate-800">{stats.indeferidos}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Média Per Capita</p>
            <p className="text-2xl font-bold text-slate-800">R$ {stats.avgPerCapita.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-6">Proporção de Aprovação</h3>
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
                  <Tooltip formatter={(val: number) => [val, 'Estudantes']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-6">Distribuição por Cidade/Bairro</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip wrapperStyle={{ outline: 'none' }} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avaliados" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
