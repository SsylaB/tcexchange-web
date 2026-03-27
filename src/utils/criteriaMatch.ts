import type { Destination, TableCell, TableCellLevel, TableRow } from "../types/compare";
import "../styles/Compare/ComparePage.css";
import "../styles/Compare/CompareHero.css";
import "../styles/Compare/CompareSelector.css";
import "../styles/Compare/CompareCriteria.css";
import "../styles/Compare/CompareResults.css";
import "../styles/Compare/CompareTable.css";
import "../styles/Compare/CompareChats.css";

type RawCriterionEntry = {
  criterion?: string;
  level?: string;
  assessment?: string;
};

type RawDestinationSummary = {
  name?: string;
  shortIntro?: string;
  criteriaBreakdown?: RawCriterionEntry[];
  bestFor?: string;
};

type SummarySource = Record<string, string> | RawDestinationSummary[];

const CRITERIA_KEYWORDS: Record<string, string[]> = {
  "Petit budget (-1000 euros)": [
    "budget",
    "abordable",
    "peu cher",
    "coût",
    "cout",
    "économique",
    "economique",
    "moins cher",
    "pas cher",
    "modéré",
    "modere",
    "faible budget",
  ],
  "Budget élevé": [
    "cher",
    "coûteux",
    "couteux",
    "élevé",
    "eleve",
    "dépenses importantes",
    "depenses importantes",
    "budget conséquent",
    "budget consequent",
    "plus cher",
  ],
  "Proche de Lyon": [
    "proche",
    "france",
    "voisin",
    "frontalier",
    "europe",
    "accessible",
    "court trajet",
  ],
  "Destination lointaine": [
    "loin",
    "lointain",
    "lointaine",
    "continent",
    "amérique",
    "amerique",
    "asie",
    "afrique",
    "australie",
    "overseas",
    "hors europe",
    "long trajet",
  ],
  "Intensité forte": [
    "intense",
    "exigeant",
    "rigoureux",
    "difficile",
    "fort niveau",
    "rythme soutenu",
    "dense",
  ],
  "Ambiance équilibrée": [
    "équilibr",
    "equilibr",
    "bon compromis",
    "équilibre",
    "equilibre",
    "balance",
  ],
  Informatique: [
    "informatique",
    "computer",
    "software",
    "numérique",
    "numerique",
    "développement informatique",
    "programmation",
    "computer science",
  ],
  "Systèmes embarqués": [
    "embarqué",
    "embarque",
    "embedded",
    "systèmes",
    "systemes",
  ],
  "Génie industriel": [
    "industriel",
    "industrie",
    "génie industriel",
    "genie industriel",
    "production",
  ],
  "Cours magistraux": [
    "cours magistraux",
    "cours théoriques",
    "cours theoriques",
    "lecture",
    "enseignement classique",
  ],
  Recherche: ["recherche", "laboratoire", "lab", "labo", "research"],
  "Projets de groupe": [
    "projet",
    "groupe",
    "équipe",
    "equipe",
    "team project",
    "travail collectif",
  ],
  "Secteur Tech / IA": [
    "tech",
    "ia",
    "intelligence artificielle",
    "innovation technologique",
    "silicon",
    "ai",
    "innovation",
    "numérique",
    "numerique",
  ],
  "Secteur Startup": [
    "startup",
    "entrepreneuriat",
    "incubateur",
    "écosystème startup",
    "ecosysteme startup",
  ],
  "Secteur Industrie": [
    "industrie",
    "manufacture",
    "industriel",
    "grand groupe",
  ],
  "Climat chaud": [
    "chaud",
    "méditerranéen",
    "mediterraneen",
    "soleil",
    "ensoleillé",
    "ensoleille",
    "subtropical",
    "chaleur",
    "doux",
  ],
  "Climat froid": ["froid", "nordique", "hiver", "neige", "hivernal", "rude"],
  "Grande métropole": [
    "métropole",
    "metropole",
    "grande ville",
    "capitale",
    "millions d'habitants",
    "urbain",
  ],
  "Campus universitaire": ["campus", "campus universitaire", "vie de campus"],
  "Destination exotique": [
    "exotique",
    "dépaysant",
    "depaysant",
    "hors europe",
    "amérique latine",
    "amerique latine",
    "asie",
    "afrique",
    "expérience singulière",
    "experience singuliere",
  ],
  "Vie sociale animée": [
    "sociale animée",
    "sociale animee",
    "vie sociale",
    "animée",
    "animee",
    "festif",
    "soirée",
    "soiree",
    "sorties",
    "nocturne",
    "nightlife",
    "vie étudiante",
    "vie etudiante",
    "ambiance",
  ],
  "Culture & gastronomie": [
    "culture",
    "gastronomie",
    "cuisine",
    "culinaire",
    "art",
    "musée",
    "musee",
    "patrimoine",
    "gastronomique",
  ],
  "Sport & outdoor": [
    "sport",
    "outdoor",
    "montagne",
    "ski",
    "randonnée",
    "randonnee",
    "plage",
    "activités sportives",
    "activites sportives",
    "plein air",
  ],
  "Networking pro": [
    "networking",
    "réseau professionnel",
    "reseau professionnel",
    "contacts professionnels",
    "opportunités pro",
    "opportunites pro",
    "professionnel",
    "carrière",
    "carriere",
  ],
  "Immersion culturelle": [
    "immersion culturelle",
    "immersion",
    "culture locale",
    "intégration locale",
    "integration locale",
  ],
  "Apprentissage de langue": [
    "apprendre la langue",
    "pratiquer",
    "cours de langue",
    "immersion linguistique",
    "progression linguistique",
  ],
  "Mathématiques et Signal": [
    "math",
    "mathématiques",
    "mathematiques",
    "signal",
    "traitement du signal",
  ],
  "Réseaux et Télécoms": [
    "réseaux",
    "reseaux",
    "télécoms",
    "telecoms",
    "télécommunications",
    "telecommunications",
    "network",
    "réseau",
    "reseau",
  ],
  "Informatique et Logiciels": [
    "informatique",
    "logiciels",
    "logiciel",
    "software",
    "computer science",
    "programmation",
    "développement",
    "developpement",
  ],
};

const LANGUAGE_LABELS: Record<string, string[]> = {
  Anglais: ["en"],
  Anglophone: ["en"],
  Espagnol: ["es"],
  Hispanophone: ["es"],
  Allemand: ["de"],
  Germanophone: ["de"],
  Italien: ["it"],
  Italophone: ["it"],
  "Langue asiatique": ["zh", "ja", "ko", "zh-cn", "zh-tw", "asia-lang"],
};

const EXCHANGE_TYPE_LABELS: Record<string, string[]> = {
  "Erasmus+": ["erasmus"],
  Bilatéral: ["bilatéral", "bilateral"],
  "Double Diplôme": ["double"],
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getKeywords(label: string): string[] {
  return (CRITERIA_KEYWORDS[label] ?? [label]).map(normalizeText);
}

function levelScore(level: TableCellLevel): number {
  if (level === "yes") return 1;
  if (level === "medium") return 0.5;
  return 0;
}

function normalizeLevel(value: unknown): TableCellLevel {
  const text = normalizeText(value);

  if (
    text === "yes" ||
    text === "oui" ||
    text.includes("fort") ||
    text.includes("favorable") ||
    text.includes("solide") ||
    text.includes("pertinent") ||
    text.includes("bon")
  ) {
    return "yes";
  }

  if (
    text === "medium" ||
    text === "moyen" ||
    text.includes("mitige") ||
    text.includes("mitigé") ||
    text.includes("equilibre") ||
    text.includes("equilibré") ||
    text.includes("correct") ||
    text.includes("plutot") ||
    text.includes("nuance")
  ) {
    return "medium";
  }

  return "no";
}

function matchesLanguage(dest: Destination, label: string): boolean | null {
  const codes = LANGUAGE_LABELS[label];
  if (!codes) return null;

  const langs = (dest.languages ?? []).map((l) => l.toLowerCase());
  return codes.some((code) => langs.includes(code));
}

function matchesExchangeType(dest: Destination, label: string): boolean | null {
  const substrings = EXCHANGE_TYPE_LABELS[label];
  if (!substrings) return null;

  const type = (dest.type ?? "").toLowerCase();
  return substrings.some((s) => type.includes(s));
}

function matchesKeywordsInText(text: string, label: string): boolean {
  const keywords = getKeywords(label);
  if (!text) return false;

  const lower = normalizeText(text);
  return keywords.some((kw) => lower.includes(kw));
}

function buildRawSummaryMap(
  rawSummaries: RawDestinationSummary[] | undefined
): Map<string, RawDestinationSummary> {
  const map = new Map<string, RawDestinationSummary>();

  for (const item of rawSummaries ?? []) {
    const name = normalizeText(item?.name);
    if (!name) continue;
    map.set(name, item);
  }

  return map;
}

function buildTextSummaryMap(
  summaries: Record<string, string> | undefined
): Map<string, string> {
  const map = new Map<string, string>();

  for (const [name, text] of Object.entries(summaries ?? {})) {
    map.set(normalizeText(name), text ?? "");
  }

  return map;
}

function getStructuredEntryForLabel(
  rawSummary: RawDestinationSummary | undefined,
  label: string
): RawCriterionEntry | null {
  if (!rawSummary?.criteriaBreakdown?.length) return null;

  const keywords = getKeywords(label);

  let bestEntry: RawCriterionEntry | null = null;
  let bestScore = -1;

  for (const entry of rawSummary.criteriaBreakdown) {
    const criterion = normalizeText(entry?.criterion);
    const assessment = normalizeText(entry?.assessment);
    const combined = `${criterion} ${assessment}`.trim();

    let localScore = 0;
    for (const kw of keywords) {
      if (criterion.includes(kw)) localScore += 3;
      else if (combined.includes(kw)) localScore += 1;
    }

    if (localScore > bestScore) {
      bestScore = localScore;
      bestEntry = entry;
    }
  }

  return bestScore > 0 ? bestEntry : null;
}

function buildDirectCell(
  level: TableCellLevel,
  text: string
): TableCell {
  return { level, text };
}

function buildFallbackCellFromText(
  analysis: string,
  label: string
): TableCell {
  if (!analysis || !matchesKeywordsInText(analysis, label)) {
    return { level: "no", text: "" };
  }

  const normalized = normalizeText(analysis);

  if (
    normalized.includes("fort") ||
    normalized.includes("solide") ||
    normalized.includes("excellent") ||
    normalized.includes("tres bon") ||
    normalized.includes("très bon") ||
    normalized.includes("bon choix") ||
    normalized.includes("pertinent")
  ) {
    return { level: "yes", text: "" };
  }

  if (
    normalized.includes("mitige") ||
    normalized.includes("mitigé") ||
    normalized.includes("plutot") ||
    normalized.includes("plutôt") ||
    normalized.includes("equilibre") ||
    normalized.includes("équilibre") ||
    normalized.includes("correct")
  ) {
    return { level: "medium", text: "" };
  }

  return { level: "medium", text: "" };
}

function buildCellForCriterion(
  dest: Destination,
  label: string,
  rawSummaryMap: Map<string, RawDestinationSummary>,
  textSummaryMap: Map<string, string>
): TableCell {
  const typeMatch = matchesExchangeType(dest, label);
  if (typeMatch !== null) {
    return buildDirectCell(
      typeMatch ? "yes" : "no",
      typeMatch ? "Correspond au type d'échange." : "Ne correspond pas au type d'échange."
    );
  }

  const langMatch = matchesLanguage(dest, label);
  if (langMatch !== null) {
    return buildDirectCell(
      langMatch ? "yes" : "no",
      langMatch ? "Langue proposée." : "Langue non proposée."
    );
  }

  const destKey = normalizeText(dest.name);
  const rawSummary = rawSummaryMap.get(destKey);
  const structuredEntry = getStructuredEntryForLabel(rawSummary, label);

  if (structuredEntry) {
    return {
      level: normalizeLevel(structuredEntry.level),
      text: String(structuredEntry.assessment ?? "").trim(),
    };
  }

  const analysis = textSummaryMap.get(destKey) || dest.description || "";
  return buildFallbackCellFromText(analysis, label);
}

function buildComparisonText(
  label: string,
  destinations: Destination[],
  cells: TableCell[]
): string {
  const parts = destinations.map((dest, index) => {
    const cell = cells[index];
    const destName = dest.shortName || dest.name;

    if (cell.text) {
      return `${destName} : ${cell.text}`;
    }

    if (cell.level === "yes") {
      return `${destName} : point plutôt fort`;
    }

    if (cell.level === "medium") {
      return `${destName} : point correct mais nuancé`;
    }

    return `${destName} : point faible ou peu mis en avant`;
  });

  const yesCount = cells.filter((cell) => cell.level === "yes").length;
  const mediumCount = cells.filter((cell) => cell.level === "medium").length;

  let intro = "";
  if (yesCount === cells.length) {
    intro = `${label} : les deux destinations sont convaincantes, mais pas forcément pour les mêmes raisons.`;
  } else if (yesCount === 1 && cells.length === 2) {
    const winnerIndex = cells.findIndex((cell) => cell.level === "yes");
    const winnerName =
      winnerIndex >= 0
        ? destinations[winnerIndex].shortName || destinations[winnerIndex].name
        : "Une destination";
    intro = `${label} : avantage plutôt pour ${winnerName}.`;
  } else if (mediumCount === cells.length) {
    intro = `${label} : les deux options se défendent, sans avantage très net.`;
  } else {
    intro = `${label} : ce critère aide surtout à nuancer les deux options.`;
  }

  return `${intro} ${parts.join(" | ")}`;
}

export function computeTableRows(
  destinations: Destination[],
  criteriaWithGroups: Array<{ group: string; label: string }>,
  summariesOrRawCriteria: SummarySource
): TableRow[] {
  const rawSummaries = Array.isArray(summariesOrRawCriteria)
    ? summariesOrRawCriteria
    : undefined;

  const textSummaries = !Array.isArray(summariesOrRawCriteria)
    ? summariesOrRawCriteria
    : undefined;

  const rawSummaryMap = buildRawSummaryMap(rawSummaries);
  const textSummaryMap = buildTextSummaryMap(textSummaries);

  return criteriaWithGroups.map(({ group, label }) => {
    const cells = destinations.map((dest) =>
      buildCellForCriterion(dest, label, rawSummaryMap, textSummaryMap)
    );

    return {
      group,
      label,
      cells,
      comparison: buildComparisonText(label, destinations, cells),
    };
  });
}

export function computeDestinationScore(tableRows: TableRow[], destinationIndex: number): number {
  if (!tableRows.length) return 0;

  const total = tableRows.reduce((sum, row) => {
    const cell = row.cells[destinationIndex];
    return sum + levelScore(cell?.level ?? "no");
  }, 0);

  return Math.round((total / tableRows.length) * 100);
}