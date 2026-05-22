import { Student, NucleusMember } from '../types';

export const initializeSpreadsheet = async (): Promise<string> => {
  const response = await fetch('/api/sheets/init', { method: 'POST' });
  const result = await response.json();
  if (!response.ok) {
     if (result.error?.includes('Faltam credenciais')) {
        throw new Error('CONFIG_REQUIRED');
     }
     throw new Error(result.error || 'Falha ao inicializar planilha');
  }
  return result.spreadsheetId;
};

export const fetchAllData = async () => {
  const response = await fetch('/api/sheets/data');
  const result = await response.json();
  if (!response.ok) {
     if (result.error?.includes('Faltam credenciais')) {
        throw new Error('CONFIG_REQUIRED');
     }
     throw new Error(result.error || 'Falha ao buscar dados');
  }

  const estudantesRows = result.estudantesRows || [];
  const nucleoRows = result.nucleoRows || [];

  const students: Student[] = estudantesRows.map((row: any[]) => ({
    id: row[0] || '',
    name: row[1] || '',
    city: row[2] || '',
    idDocs: row[3] ? JSON.parse(row[3]) : [],
    incomeDocs: row[4] ? JSON.parse(row[4]) : [],
    incomeValue: Number(row[5] || 0),
    scores: row[6] ? JSON.parse(row[6]) : { FE: 0, RF: 0, IV: 0, FA: 0 },
    createdAt: row[7] || new Date().toISOString()
  }));

  const nucleusMembers: NucleusMember[] = nucleoRows.map((row: any[]) => ({
    id: row[0] || '',
    studentId: row[1] || '',
    name: row[2] || '',
    idDocs: row[3] ? JSON.parse(row[3]) : [],
    incomeDocs: row[4] ? JSON.parse(row[4]) : [],
    incomeValue: Number(row[5] || 0)
  }));

  return { students, nucleusMembers, spreadsheetId: result.spreadsheetId };
};

export const appendStudentToSheet = async (student: Student) => {
  const response = await fetch('/api/sheets/student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student })
  });
  if (!response.ok) throw new Error('Falha ao salvar estudante na planilha');
};

export const appendNucleusToSheet = async (member: NucleusMember) => {
  const response = await fetch('/api/sheets/nucleus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member })
  });
  if (!response.ok) throw new Error('Falha ao salvar parente na planilha');
};
