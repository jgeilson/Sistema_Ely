import { Document } from './types';

export const MINIMUM_WAGE = 1412.00;

export const DEFAULT_ID_DOCS_STUDENT = [
  "RG do Estudante",
  "CPF do Estudante",
  "Comprovante de Residência",
  "Certidão de Nascimento",
  "Histórico Escolar",
  "Comprovante de Matrícula",
  "Declaração de Vínculo",
  "Ficha de Inscrição",
  "Termo de Compromisso",
  "Foto 3x4",
  "Outros Documentos ID"
];

export const DEFAULT_INCOME_DOCS_STUDENT = [
  "CTPS (Carteira de Trabalho)",
  "Contracheque 1",
  "Contracheque 2",
  "Contracheque 3",
  "Declaração de IR",
  "Extrato Bancário",
  "Declaração de Autônomo",
  "Comprovante de Pensão",
  "Comprovante de Auxílio",
  "Declaração de Desemprego",
  "Dec. de Rendimentos Diversos",
  "Outros Documentos Renda"
];

export const DEFAULT_ID_DOCS_NUCLEUS = [
  "RG",
  "CPF",
  "Certidão de Nascimento",
  "Certidão de Casamento",
  "Declaração de União Estável",
  "Outros Documentos ID (Núcleo)"
];

export const DEFAULT_INCOME_DOCS_NUCLEUS = [
  "CTPS (Carteira de Trabalho)",
  "Contracheque 1",
  "Contracheque 2",
  "Contracheque 3",
  "Declaração de IR",
  "Extrato Bancário",
  "Declaração de Autônomo",
  "Comprovante de Pensão",
  "Comprovante de Auxílio",
  "Declaração de Desemprego",
  "Dec. de Rendimentos Diversos",
  "Outros Documentos Renda"
];

export const createDefaultDocs = (names: string[]): Document[] => {
  return names.map(name => ({
    name,
    status: 'Não se Aplica'
  }));
};
