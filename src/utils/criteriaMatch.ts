import type { Destination, TableRow } from "../types/compare";

// Mots-clés à chercher dans le texte d'analyse IA pour chaque critère sémantique
const CRITERIA_KEYWORDS: Record<string, string[]> = {
  "Petit budget (-1000 euros)": ["budget", "abordable", "peu cher", "coût", "économique", "moins cher", "pas cher"],
  "Budget élevé": ["cher", "coûteux", "élevé", "dépenses importantes", "budget conséquent"],
  "Proche de Lyon": ["proche", "France", "voisin", "frontalier", "Europe"],
  "Destination lointaine": ["loin", "lointain", "continent", "Amérique", "Asie", "Afrique", "Australie", "overseas"],
  "Intensité forte": ["intense", "exigeant", "rigoureux", "difficile", "fort niveau"],
  "Ambiance équilibrée": ["équilibr"],
  "Informatique": ["informatique", "computer", "software", "numérique", "développement informatique"],
  "Systèmes embarqués": ["embarqué", "embedded", "systèmes"],
  "Génie industriel": ["industriel", "industrie"],
  "Cours magistraux": ["cours magistraux", "cours théoriques", "lecture"],
  "Recherche": ["recherche", "laboratoire", "lab"],
  "Projets de groupe": ["projet", "groupe", "équipe"],
  "Secteur Tech / IA": ["tech", "IA", "intelligence artificielle", "innovation technologique", "Silicon"],
  "Secteur Startup": ["startup", "entrepreneuriat", "incubateur"],
  "Secteur Industrie": ["industrie", "manufacture"],
  "Climat chaud": ["chaud", "méditerranéen", "soleil", "ensoleillé", "subtropical", "chaleur", "doux"],
  "Climat froid": ["froid", "nordique", "hiver", "neige", "hivernal", "rude"],
  "Grande métropole": ["métropole", "grande ville", "capitale", "millions d'habitants"],
  "Campus universitaire": ["campus"],
  "Destination exotique": ["exotique", "dépaysant", "hors Europe", "Amérique latine", "Asie", "Afrique"],
  "Vie sociale animée": ["sociale animée", "vie sociale", "animée", "festif", "soirée", "sorties", "nocturne", "nightlife"],
  "Culture & gastronomie": ["culture", "gastronomie", "cuisine", "culinaire", "art", "musée", "patrimoine", "gastronomique"],
  "Sport & outdoor": ["sport", "outdoor", "montagne", "ski", "randonnée", "plage", "activités sportives"],
  "Networking pro": ["networking", "réseau professionnel", "contacts professionnels"],
  "Immersion culturelle": ["immersion culturelle", "immersion", "culture locale"],
  "Apprentissage de langue": ["apprendre la langue", "pratiquer", "cours de langue"],
};

// Mapping langue label → code langue dans destination.languages
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

// Mapping type d'échange label → substring à chercher dans destination.type
const EXCHANGE_TYPE_LABELS: Record<string, string[]> = {
  "Erasmus+": ["erasmus"],
  Bilatéral: ["bilatéral", "bilateral"],
  "Double Diplôme": ["double"],
};

function matchesLanguage(dest: Destination, label: string): boolean | null {
  const codes = LANGUAGE_LABELS[label];
  if (!codes) return null;
  return codes.some((code) => dest.languages.map((l) => l.toLowerCase()).includes(code));
}

function matchesExchangeType(dest: Destination, label: string): boolean | null {
  const substrings = EXCHANGE_TYPE_LABELS[label];
  if (!substrings) return null;
  const type = dest.type.toLowerCase();
  return substrings.some((s) => type.includes(s));
}

function matchesKeywords(analysisText: string, label: string): boolean {
  const keywords = CRITERIA_KEYWORDS[label];
  if (!keywords || !analysisText) return false;
  const lower = analysisText.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

export function computeTableRows(
  destinations: Destination[],
  criteriaWithGroups: Array<{ group: string; label: string }>,
  summaries: Record<string, string>
): TableRow[] {
  return criteriaWithGroups.map(({ group, label }) => {
    const matches = destinations.map((dest) => {
      // 1. Type d'échange — matching direct
      const typeMatch = matchesExchangeType(dest, label);
      if (typeMatch !== null) return typeMatch;

      // 2. Langue — matching direct sur destination.languages
      const langMatch = matchesLanguage(dest, label);
      if (langMatch !== null) return langMatch;

      // 3. Critères sémantiques — recherche de mots-clés dans l'analyse IA
      const analysis = summaries[dest.name] ?? dest.description ?? "";
      return matchesKeywords(analysis, label);
    });

    return { group, label, matches };
  });
}
