import React, { useState } from 'react';

interface EditalSelectProps {
  editais: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function EditalSelect({ editais, value, onChange, placeholder = "Ex: Edital 01/2024" }: EditalSelectProps) {
  const [open, setOpen] = useState(false);

  const filteredEditais = editais.filter(e => 
    e.toLowerCase().includes(value.toLowerCase()) && e !== value
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => { 
          onChange(e.target.value); 
          setOpen(true); 
        }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="w-full border-slate-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
        placeholder={placeholder}
        required
      />

      {open && filteredEditais.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredEditais.map(e => (
            <div 
              key={e} 
              onMouseDown={(ev) => {
                // use onMouseDown to prevent input blur before click
                ev.preventDefault();
                onChange(e);
                setOpen(false);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors text-slate-700"
            >
              {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
