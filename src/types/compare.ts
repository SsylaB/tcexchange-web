export type Destination = {
  id: number;
  country: string;
  name: string;
  dest: string;
  type: string;
  bg?: string;
  features: string[];
  description: string;
  location: string;
  url: string;
  languages: string[];
  shortName: string;
  rawExchangeType: string;
};

export type TableCellLevel = "yes" | "medium" | "no";

export type TableCell = {
  level: TableCellLevel;
  text?: string;
  explanation?: string;
  assessment?: string; // Pour Gemini/Ollama
};

export type TableRow = {
  group: string;
  label: string;
  cells: TableCell[];
};

export type AiSummary = {
  name: string;
  analysis: string;
  shortIntro?: string; // Ajouté pour correspondre à ton erreur précédente
  bestFor?: string;    // Ajouté pour correspondre à ton erreur précédente
};

export type AiResult = {
  destinationSummaries: AiSummary[]; // LE CHAMP QUI MANQUAIT
  ranking: string[];
  verdict: string;
  tableRows: TableRow[];
  rawCriteria?: any[]; // Flexible pour éviter l'erreur sur l'objet complexe
};

// Ce type semble être utilisé à l'intérieur de ollama.ts
export interface CompareResultWithRawCriteria extends AiResult {
  rawCriteria?: any[];
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};