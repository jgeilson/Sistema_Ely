import { Document } from './types';

export const MINIMUM_WAGE = 1621.00;

export const DEFAULT_ID_DOCS_STUDENT = [
  "RG",
  "CPF",
  "CNH",
  "Outro documento de identificação",
  "Comprovante de residência",
  "Histórico Escolar - Frente",
  "Histórico Escolar - Verso",
  "Laudo/Comprovante de Deficiência"
];

export const DEFAULT_INCOME_DOCS_STUDENT = [
  "Declaração de Não Remunerado",
  "Comprovante de Bolsa / Estágio",
  "Comprovante de Renda (CTPS/Contracheque)",
  "Declaração de Trabalho Rural",
  "Declaração de Autônomo",
  "Comprovante de Aposentadoria / Pensão",
  "Declaração de Imposto de Renda (IR)",
  "Outros Documentos de Renda"
];

export const DEFAULT_ID_DOCS_NUCLEUS = [
  "RG",
  "CPF",
  "CNH",
  "Certidão de Nascimento",
  "Certidão de Casamento",
  "Outros Documentos",
  "Laudo/Comprovante de Deficiência",
  "Termo de Guarda (Menor de Idade)"
];

export const DEFAULT_INCOME_DOCS_NUCLEUS = [
  "Declaração de Não Remunerado",
  "Comprovante de Bolsa / Estágio",
  "Comprovante de Renda (CTPS/Contracheque)",
  "Declaração de Trabalho Rural",
  "Declaração de Autônomo",
  "Comprovante de Aposentadoria / Pensão",
  "Declaração de Imposto de Renda (IR)",
  "Outros Documentos de Renda"
];

export const createDefaultDocs = (names: string[]): Document[] => {
  return names.map(name => ({
    name,
    status: 'Não se Aplica'
  }));
};
