import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Student, NucleusMember, ClassificationResult } from '../types';
import { MINIMUM_WAGE } from '../constants';
import { initializeSpreadsheet, fetchAllData, appendStudentToSheet, appendNucleusToSheet } from '../lib/sheets';

interface AppState {
  students: Student[];
  nucleusMembers: NucleusMember[];
}

interface AppContextType {
  state: AppState;
  spreadsheetId: string | null;
  loading: boolean;
  configRequired: boolean;
  retryConnection: () => Promise<void>;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  addNucleusMember: (member: NucleusMember) => Promise<void>;
  updateNucleusMember: (member: NucleusMember) => void;
  deleteNucleusMember: (memberId: string) => void;
  getClassifications: () => ClassificationResult[];
}

const defaultState: AppState = {
  students: [],
  nucleusMembers: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [configRequired, setConfigRequired] = useState(false);

  useEffect(() => {
    retryConnection();
  }, []);

  const retryConnection = async () => {
    setLoading(true);
    setConfigRequired(false);
    try {
      const sid = await initializeSpreadsheet();
      setSpreadsheetId(sid);
      const data = await fetchAllData();
      setState(data);
    } catch (error: any) {
      console.error("Failed to load from sheets", error);
      if (error.message === 'CONFIG_REQUIRED') {
        setConfigRequired(true);
        // Quando não houver credenciais, mantém o state vazio/local
      }
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: Student) => {
    setState(s => ({ ...s, students: [...s.students, student] }));
    try {
      if (!configRequired) {
        await appendStudentToSheet(student);
      }
    } catch (e) {
      console.error("Erro ao salvar na planilha:", e);
    }
  };

  const updateStudent = (student: Student) => {
    setState(s => ({
      ...s,
      students: s.students.map(st => st.id === student.id ? student : st)
    }));
  };

  const deleteStudent = (studentId: string) => {
    setState(s => ({
      ...s,
      students: s.students.filter(st => st.id !== studentId),
      nucleusMembers: s.nucleusMembers.filter(n => n.studentId !== studentId)
    }));
  };

  const addNucleusMember = async (member: NucleusMember) => {
    setState(s => ({ ...s, nucleusMembers: [...s.nucleusMembers, member] }));
    try {
      if (!configRequired) {
        await appendNucleusToSheet(member);
      }
    } catch (e) {
      console.error("Erro ao salvar na planilha:", e);
    }
  };

  const updateNucleusMember = (member: NucleusMember) => {
    setState(s => ({
      ...s,
      nucleusMembers: s.nucleusMembers.map(n => n.id === member.id ? member : n)
    }));
  };

  const deleteNucleusMember = (memberId: string) => {
    setState(s => ({
      ...s,
      nucleusMembers: s.nucleusMembers.filter(n => n.id !== memberId)
    }));
  };

  const getClassifications = (): ClassificationResult[] => {
    return state.students.map(student => {
      const family = state.nucleusMembers.filter(n => n.studentId === student.id);
      
      // Checar se há documentos incompletos / não enviados (Causa Indeferimento imediato)
      const hasMissingDoc = (docs: any[]) => docs.some(d => d.status === 'Incompleto' || d.status === 'Não Enviou');
      
      let isDeferred = true;
      let reason = '';

      if (hasMissingDoc(student.idDocs) || hasMissingDoc(student.incomeDocs)) {
        isDeferred = false;
        reason = 'Documentação do estudante incompleta ou não enviada.';
      } else {
        for (const member of family) {
          if (hasMissingDoc(member.idDocs) || hasMissingDoc(member.incomeDocs)) {
            isDeferred = false;
            reason = 'Documentação do núcleo familiar incompleta ou não enviada.';
            break;
          }
        }
      }

      const familySize = family.length + 1; // +1 for the student
      const totalIncome = student.incomeValue + family.reduce((acc, m) => acc + m.incomeValue, 0);
      const perCapitaIncome = totalIncome / familySize;

      let incomeScore = 0;
      if (perCapitaIncome <= MINIMUM_WAGE / 2) {
        incomeScore = 30;
      } else if (perCapitaIncome <= MINIMUM_WAGE) {
        incomeScore = 20;
      } else {
        incomeScore = 0;
      }

      const totalScore = incomeScore + student.scores.FE + student.scores.RF + student.scores.IV + student.scores.FA;

      return {
        student,
        status: isDeferred ? 'Deferido' : 'Indeferido',
        reason,
        familySize,
        totalIncome,
        perCapitaIncome,
        incomeScore,
        totalScore
      };
    }).sort((a, b) => {
      if (a.status === 'Deferido' && b.status === 'Indeferido') return -1;
      if (a.status === 'Indeferido' && b.status === 'Deferido') return 1;
      return b.totalScore - a.totalScore;
    });
  };

  return (
    <AppContext.Provider value={{
      state,
      spreadsheetId,
      loading,
      configRequired,
      retryConnection,
      addStudent,
      updateStudent,
      deleteStudent,
      addNucleusMember,
      updateNucleusMember,
      deleteNucleusMember,
      getClassifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
