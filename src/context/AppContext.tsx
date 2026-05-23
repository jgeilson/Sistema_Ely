import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Student, NucleusMember, ClassificationResult } from '../types';
import { MINIMUM_WAGE } from '../constants';
import { 
  initializeSpreadsheet, 
  fetchAllData, 
  appendStudentToSheet, 
  appendNucleusToSheet,
  updateStudentInSheet,
  deleteStudentFromSheet,
  updateNucleusInSheet,
  deleteNucleusFromSheet
} from '../lib/sheets';

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
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addNucleusMember: (member: NucleusMember) => Promise<void>;
  updateNucleusMember: (member: NucleusMember) => Promise<void>;
  deleteNucleusMember: (memberId: string) => Promise<void>;
  getClassifications: () => ClassificationResult[];
  getEditais: () => string[];
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

  const updateStudent = async (student: Student) => {
    setState(s => ({
      ...s,
      students: s.students.map(st => st.id === student.id ? student : st)
    }));
    try {
      if (!configRequired) {
        await updateStudentInSheet(student);
      }
    } catch (e) {
      console.error("Erro ao atualizar na planilha:", e);
    }
  };

  const deleteStudent = async (studentId: string) => {
    setState(s => ({
      ...s,
      students: s.students.filter(st => st.id !== studentId),
      nucleusMembers: s.nucleusMembers.filter(n => n.studentId !== studentId)
    }));
    try {
      if (!configRequired) {
        await deleteStudentFromSheet(studentId);
      }
    } catch (e) {
      console.error("Erro ao deletar na planilha:", e);
    }
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

  const updateNucleusMember = async (member: NucleusMember) => {
    setState(s => ({
      ...s,
      nucleusMembers: s.nucleusMembers.map(n => n.id === member.id ? member : n)
    }));
    try {
      if (!configRequired) {
        await updateNucleusInSheet(member);
      }
    } catch (e) {
      console.error("Erro ao atualizar parente na planilha:", e);
    }
  };

  const deleteNucleusMember = async (memberId: string) => {
    setState(s => ({
      ...s,
      nucleusMembers: s.nucleusMembers.filter(n => n.id !== memberId)
    }));
    try {
      if (!configRequired) {
        await deleteNucleusFromSheet(memberId);
      }
    } catch (e) {
      console.error("Erro ao deletar parente na planilha:", e);
    }
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

  const getEditais = () => {
    const set = new Set(state.students.map(s => s.edital).filter(Boolean));
    return Array.from(set).sort();
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
      getClassifications,
      getEditais
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
