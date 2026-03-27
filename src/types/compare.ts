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

export type CriteriaGroupMap = Record<string, string[]>;

export type TableRow = {
  group: string;
  label: string;
  matches: boolean[];
};

export type AiSummary = {
  name: string;
  analysis: string;
};

export type AiResult = {
  destinationSummaries: AiSummary[];
  ranking: string[];
  verdict: string;
  tableRows: TableRow[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};