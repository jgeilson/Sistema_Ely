export type DocStatus = 'Completo' | 'Incompleto' | 'Não Enviou' | 'Não se Aplica';

export interface Document {
  name: string;
  status: DocStatus;
  observation?: string; 
}

export interface Scores {
  FE: number;
  RF: number;
  IV: number;
  FA: number;
}

export interface Student {
  id: string; // Gerado via UUID ou usando o nome (como no script original)
  name: string;
  city: string;
  edital: string;
  idDocs: Document[];
  incomeDocs: Document[];
  incomeValue: number;
  scores: Scores;
  createdAt: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface NucleusMember {
  id: string;
  studentId: string;
  name: string;
  idDocs: Document[];
  incomeDocs: Document[];
  incomeValue: number;
}

export interface PendencyDetail {
  personName: string;
  isStudent: boolean;
  documents: {
    name: string;
    observation?: string;
  }[];
}

export interface ClassificationResult {
  student: Student;
  status: 'Deferido' | 'Indeferido';
  reason?: string;
  pendencies?: PendencyDetail[];
  familySize: number;
  totalIncome: number;
  perCapitaIncome: number;
  incomeScore: number;
  totalScore: number;
}
