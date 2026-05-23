import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { Search, X } from 'lucide-react';

interface StudentSelectProps {
  students: Student[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function StudentSelect({ students, value, onChange, placeholder = "Buscar estudante..." }: StudentSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const selectedStudent = students.find(s => s.id === value);

  useEffect(() => {
    if (selectedStudent) {
      setSearch(`${selectedStudent.name} (${selectedStudent.city})`);
    } else {
      setSearch('');
    }
  }, [value, selectedStudent]);

  const isCurrentSelection = selectedStudent && search === `${selectedStudent.name} (${selectedStudent.city})`;
  
  const filteredStudents = isCurrentSelection || search.trim() === ''
    ? []
    : students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.city.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onFocus={() => { 
            setOpen(true); 
          }}
          onChange={(e) => { 
            setSearch(e.target.value); 
            setOpen(true); 
          }}
          onBlur={() => {
            // Slight delay so any click registering outside the list closes it safely
            setTimeout(() => {
              setOpen(false);
              if (selectedStudent) {
                setSearch(`${selectedStudent.name} (${selectedStudent.city})`);
              } else {
                setSearch('');
              }
            }, 150);
          }}
          className="w-full pl-10 pr-10 py-2 border-slate-300 rounded-md shadow-sm border focus:ring-blue-500 focus:border-blue-500 text-slate-800 text-sm"
          placeholder={placeholder}
          required={!value}
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => {
              // Reset the input instantly
              e.preventDefault();
              onChange('');
              setSearch('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <X className="w-4 h-4 animate-scaleIn" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {search.trim() === '' ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
              Digite o nome ou cidade para buscar o estudante...
            </div>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map(s => (
              <div 
                key={s.id} 
                onMouseDown={(e) => {
                  // Prevents blur event on input from firing first, ensuring instant selection on first click!
                  e.preventDefault(); 
                  onChange(s.id);
                  setSearch(`${s.name} (${s.city})`);
                  setOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors ${value === s.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
              >
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-slate-500">{s.city} {s.edital && `• ${s.edital}`}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              Nenhum estudante encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
