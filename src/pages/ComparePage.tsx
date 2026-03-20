import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import rawData from "../data/destinations.json";
import "../styles/ComparePage.css";

type RawDestination = {
  id: number;
  country: string;
  universityName: string;
  location: string;
  url: string;
  languages: string[];
  description: string;
  shortName: string;
  exchangeType: string;
};

type Destination = {
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

type CriteriaGroupMap = Record<string, string[]>;

type TableRow = {
  group: string;
  label: string;
  matches: boolean[];
};

type AiSummary = {
  name: string;
  analysis: string;
};

type AiResult = {
  destinationSummaries: AiSummary[];
  ranking: string[];
  verdict: string;
  tableRows: TableRow[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const rawDestinations = rawData as RawDestination[];

const CRITERIA_GROUPS: Record<string, CriteriaGroupMap> = {
  Logistique: {
    "Type Erasmus+": ["erasmus"],
    "Type Bilatéral": ["bilateral"],
    "Double Diplôme": ["dd"],
    "Petit budget": ["budget-mid"],
    "Budget élevé ok": ["budget-high"],
    "Proche de Lyon": ["close"],
    "Destination lointaine": ["far"],
  },
  Académique: {
    "Intensité forte": ["intense"],
    "Ambiance équilibrée": ["balanced"],
    Informatique: ["info"],
    "Systèmes embarqués": ["sys"],
    "Génie industriel": ["indus"],
    "Cours magistraux": ["learn-cours"],
    Recherche: ["learn-recherche", "sector-recherche"],
    "Projets de groupe": ["learn-projet"],
    "Secteur Tech / IA": ["sector-tech"],
    "Secteur Startup": ["sector-startup"],
    "Secteur Industrie": ["sector-indus"],
  },
  "Cadre de vie": {
    Anglophone: ["en"],
    Hispanophone: ["es"],
    Germanophone: ["de"],
    Italophone: ["it"],
    "Langue asiatique": ["asia-lang"],
    "Climat chaud": ["chaud"],
    "Climat froid": ["froid"],
    "Grande métropole": ["grande-ville"],
    "Campus universitaire": ["campus"],
    "Destination exotique": ["exotic"],
  },
  Expérience: {
    "Vie sociale animée": ["social"],
    "Culture & gastronomie": ["culture"],
    "Sport & outdoor": ["outdoor"],
    "Networking pro": ["networking", "pro"],
    "Immersion culturelle": ["learn-culture"],
    "Apprentissage de langue": ["lang-learn"],
  },
};

const ANALYSIS_MESSAGES = [
  "Analyse des destinations sélectionnées…",
  "Croisement avec les critères prioritaires…",
  "Évaluation des langues, du type d’échange et du cadre de vie…",
  "Comparaison des points forts académiques…",
  "Construction d’un verdict argumenté…",
  "Finalisation de la synthèse…",
];

function normalizeExchangeType(exchangeType: string): string {
  const value = exchangeType.toLowerCase();
  if (value.includes("erasmus")) return "Erasmus+";
  if (value.includes("bilat")) return "Accord bilatéral";
  if (value.includes("double")) return "Double diplôme";
  return exchangeType;
}

const destinations: Destination[] = rawDestinations.map((d) => ({
  id: d.id,
  country: d.country,
  name: d.universityName,
  dest: `${d.location}, ${d.country}`,
  type: normalizeExchangeType(d.exchangeType),
  bg: "var(--surface)",
  features: d.languages ?? [],
  description: d.description,
  location: d.location,
  url: d.url,
  languages: d.languages ?? [],
  shortName: d.shortName,
  rawExchangeType: d.exchangeType,
}));

function stripMarkdown(text: string) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();
}

function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(stripMarkdown(text)) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function readFavoriteIdsFromStorage(): number[] {
  const candidateKeys = [
    "favorites",
    "favoriteIds",
    "favoriteDestinations",
    "destinationsFavorites",
  ];

  const ids = new Set<number>();

  for (const key of candidateKeys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === "number") ids.add(item);
          if (
            item &&
            typeof item === "object" &&
            "id" in item &&
            typeof item.id === "number"
          ) {
            ids.add(item.id);
          }
        }
      }
    } catch {
      continue;
    }
  }

  return [...ids];
}

async function ollamaGenerate(prompt: string) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}`);
  }

  const data = await response.json();
  return String(data.response || "");
}

async function callOllamaMultiCompare(
  selectedDestinations: Destination[],
  selectedCriteria: string[]
) {
  const destinationsBlock = selectedDestinations
    .map(
      (d, i) => `
DESTINATION_${i + 1}
name: ${d.name}
country: ${d.country}
location: ${d.location}
type: ${d.type}
languages: ${(d.languages || []).join(", ") || "Non précisé"}
description: ${d.description || "Non précisé"}
`
    )
    .join("\n");

  const prompt = `Tu compares plusieurs destinations universitaires pour un étudiant INSA TC.

Critères importants :
${selectedCriteria.join(", ")}

Destinations :
${destinationsBlock}

Retourne uniquement un JSON valide, sans texte avant ni après, exactement sous cette forme :

{
  "destinationSummaries": [
    {
      "name": "nom exact de la destination",
      "analysis": "4 à 6 phrases utiles, concrètes et comparatives"
    }
  ],
  "ranking": ["nom exact 1", "nom exact 2"],
  "verdict": "3 à 5 phrases finales avec recommandation globale"
}

Règles :
- "destinationSummaries" doit contenir toutes les destinations fournies.
- "ranking" doit contenir toutes les destinations du meilleur au moins adapté.
- Réponds en français.
- Pas de markdown.
- Utilise exactement les noms donnés.`;

  const raw = await ollamaGenerate(prompt);

  const parsed = safeParseJson<{
    destinationSummaries?: Array<{ name?: string; analysis?: string }>;
    ranking?: string[];
    verdict?: string;
  }>(raw);

  if (!parsed) {
    return {
      destinationSummaries: selectedDestinations.map((d) => ({
        name: d.name,
        analysis: "Analyse indisponible.",
      })),
      ranking: selectedDestinations.map((d) => d.name),
      verdict: stripMarkdown(raw) || "Aucun verdict généré.",
    };
  }

  return {
    destinationSummaries: selectedDestinations.map((d) => {
      const found = parsed.destinationSummaries?.find(
        (item) => item.name?.trim() === d.name
      );
      return {
        name: d.name,
        analysis: stripMarkdown(found?.analysis || "Analyse indisponible."),
      };
    }),
    ranking:
      parsed.ranking?.filter((name) =>
        selectedDestinations.some((d) => d.name === name)
      ) || selectedDestinations.map((d) => d.name),
    verdict: stripMarkdown(parsed.verdict || "Aucun verdict généré."),
  };
}

async function callOllamaMultiTable(
  selectedDestinations: Destination[],
  criteriaWithGroups: Array<{ group: string; label: string }>
) {
  const destinationNames = selectedDestinations.map((d) => d.name).join(" | ");
  const lines = criteriaWithGroups.map((c) => c.label).join("\n");

  const prompt = `Tu évalues ${selectedDestinations.length} destinations universitaires pour un étudiant ingénieur INSA TC.

Ordre des destinations :
${destinationNames}

Pour chaque critère ci-dessous, réponds sur UNE seule ligne avec ${selectedDestinations.length} valeurs séparées par des points-virgules.
Chaque valeur doit être "oui" ou "non".
Respecte strictement l'ordre des destinations ci-dessus.
Ne réponds rien d'autre.

Exemple pour 3 destinations :
oui;non;oui

Critères :
${lines}`;

  const raw = await ollamaGenerate(prompt);

  const linesOut = raw
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.includes(";") || line === "oui" || line === "non");

  return criteriaWithGroups.map((criterion, index) => {
    const parts = (linesOut[index] || "")
      .split(";")
      .map((value) => value.trim());

    const matches = selectedDestinations.map((_, destIndex) =>
      /oui|yes|true/.test(parts[destIndex] || "")
    );

    return {
      group: criterion.group,
      label: criterion.label,
      matches,
    };
  });
}

async function callOllamaFollowup(
  selectedDestinations: Destination[],
  selectedCriteria: string[],
  aiResult: AiResult,
  messages: ChatMessage[],
  question: string
) {
  const destinationsBlock = selectedDestinations
    .map(
      (d) => `- ${d.name} (${d.dest}) | type: ${d.type} | langues: ${
        d.languages.join(", ") || "Non précisé"
      }`
    )
    .join("\n");

  const summariesBlock = aiResult.destinationSummaries
    .map((s) => `${s.name}: ${s.analysis}`)
    .join("\n");

  const historyBlock = messages
    .map((m) => `${m.role === "user" ? "Étudiant" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `Tu es un mini assistant de suivi de comparaison pour un étudiant INSA TC.
Tu réponds uniquement sur la comparaison en cours.
Tu es concis, utile, précis, et tu ne renvoies pas vers un grand chatbot.

Destinations comparées :
${destinationsBlock}

Critères choisis :
${selectedCriteria.join(", ")}

Classement actuel :
${aiResult.ranking.join(" > ")}

Synthèses actuelles :
${summariesBlock}

Verdict actuel :
${aiResult.verdict}

Historique de la mini conversation :
${historyBlock || "Aucun"}

Nouvelle question de l'étudiant :
${question}

Réponds en français, en 3 à 8 phrases maximum, sans markdown.`;

  return stripMarkdown(await ollamaGenerate(prompt));
}

function getOrderedSummaries(
  aiResult: AiResult,
  selectedDestinations: Destination[]
): AiSummary[] {
  const rankingIndex = new Map<string, number>();
  aiResult.ranking.forEach((name, index) => rankingIndex.set(name, index));

  return [...aiResult.destinationSummaries].sort((a, b) => {
    const aIndex = rankingIndex.get(a.name) ?? 999;
    const bIndex = rankingIndex.get(b.name) ?? 999;

    if (aIndex !== bIndex) return aIndex - bIndex;

    const aPos = selectedDestinations.findIndex((d) => d.name === a.name);
    const bPos = selectedDestinations.findIndex((d) => d.name === b.name);
    return aPos - bPos;
  });
}

function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`compare-card ${className}`.trim()}>{children}</section>;
}

function DestPreview({ dest }: { dest: Destination | null }) {
  if (!dest) {
    return (
      <div className="compare-empty-preview">
        <span>Aucune destination sélectionnée</span>
      </div>
    );
  }

  return (
    <div
      className="compare-preview-card"
      style={{ background: dest.bg || "var(--surface)" }}
    >
      <div>
        <div className="compare-preview-name">{dest.name}</div>
        <div className="compare-preview-country">{dest.dest}</div>
        <div className="compare-preview-badge">{dest.type}</div>
      </div>
    </div>
  );
}

function getCriteriaHeaderClass(groupName: string) {
  if (groupName === "Logistique") return "compare-criteria-header--logistique";
  if (groupName === "Académique") return "compare-criteria-header--academique";
  if (groupName === "Cadre de vie") return "compare-criteria-header--cadre";
  return "compare-criteria-header--experience";
}

function CriteriaGroup({
  groupName,
  criteria,
  selected,
  onToggle,
}: {
  groupName: string;
  criteria: CriteriaGroupMap;
  selected: Set<string>;
  onToggle: (label: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="compare-criteria-group">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`compare-criteria-header ${getCriteriaHeaderClass(groupName)}`}
      >
        <span>{groupName}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="compare-criteria-items">
          {Object.keys(criteria).map((label) => (
            <label key={label} className="compare-criteria-label">
              <input
                type="checkbox"
                checked={selected.has(label)}
                onChange={() => onToggle(label)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function getGroupRowClass(group: string) {
  if (group === "Logistique") return "compare-group-row--logistique";
  if (group === "Académique") return "compare-group-row--academique";
  if (group === "Cadre de vie") return "compare-group-row--cadre";
  return "compare-group-row--experience";
}

function MultiCompareTable({
  selectedDestinations,
  tableRows,
}: {
  selectedDestinations: Destination[];
  tableRows: TableRow[];
}) {
  if (!tableRows.length) return null;

  const totals = selectedDestinations.map(() => 0);
  for (const row of tableRows) {
    row.matches.forEach((match, index) => {
      if (match) totals[index] += 1;
    });
  }

  const percentages = totals.map((total) =>
    tableRows.length ? Math.round((total / tableRows.length) * 100) : 0
  );

  const grouped: Record<string, TableRow[]> = {};
  for (const row of tableRows) {
    if (!grouped[row.group]) grouped[row.group] = [];
    grouped[row.group].push(row);
  }

  const rows: ReactNode[] = [];

  for (const [group, items] of Object.entries(grouped)) {
    rows.push(
      <tr key={`group-${group}`}>
        <td
          colSpan={1 + selectedDestinations.length}
          className={`compare-group-row ${getGroupRowClass(group)}`}
        >
          {group}
        </td>
      </tr>
    );

    for (const item of items) {
      rows.push(
        <tr key={`${group}-${item.label}`}>
          <td className="compare-table-cell-label">{item.label}</td>
          {item.matches.map((match, index) => (
            <td
              key={`${item.label}-${index}`}
              className={match ? "compare-match-cell" : "compare-no-match-cell"}
            >
              {match ? "✓" : "✗"}
            </td>
          ))}
        </tr>
      );
    }
  }

  return (
    <div>
      <div className="compare-score-wrap">
        {selectedDestinations.map((dest, index) => (
          <div key={dest.id} className="compare-score-bar-row">
            <div className="compare-score-name">{dest.name}</div>
            <div className="compare-score-track">
              <div
                className={`compare-score-fill ${
                  index === 0
                    ? "compare-score-fill--red"
                    : index === 1
                    ? "compare-score-fill--blue"
                    : "compare-score-fill--green"
                }`}
                style={{ width: `${percentages[index]}%` }}
              />
            </div>
            <div className="compare-score-pct">{percentages[index]}%</div>
          </div>
        ))}
      </div>

      <div className="compare-table-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-table-head">Critère</th>
              {selectedDestinations.map((dest, index) => (
                <th
                  key={dest.id}
                  className={`compare-table-head ${
                    index === 0
                      ? "compare-table-head--red"
                      : index === 1
                      ? "compare-table-head--blue"
                      : "compare-table-head--green"
                  }`}
                >
                  {dest.shortName || dest.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
}

function DestinationPicker({
  label,
  value,
  onSelect,
  excludedIds,
  destinationsByCountry,
  favorites,
  accentColor,
}: {
  label: string;
  value: Destination | null;
  onSelect: (dest: Destination) => void;
  excludedIds?: number[];
  destinationsByCountry: [string, Destination[]][];
  favorites: Destination[];
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [openCountries, setOpenCountries] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleCountry(country: string) {
    setOpenCountries((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredFavorites = favorites.filter(
    (dest) =>
      !excludedIds?.includes(dest.id) &&
      (!normalizedSearch ||
        dest.name.toLowerCase().includes(normalizedSearch) ||
        dest.country.toLowerCase().includes(normalizedSearch) ||
        dest.location.toLowerCase().includes(normalizedSearch) ||
        dest.shortName.toLowerCase().includes(normalizedSearch))
  );

  const filteredCountries = destinationsByCountry
    .map(([country, items]) => {
      const filteredItems = items.filter(
        (dest) =>
          !excludedIds?.includes(dest.id) &&
          (!normalizedSearch ||
            dest.name.toLowerCase().includes(normalizedSearch) ||
            dest.country.toLowerCase().includes(normalizedSearch) ||
            dest.location.toLowerCase().includes(normalizedSearch) ||
            dest.shortName.toLowerCase().includes(normalizedSearch))
      );

      return [country, filteredItems] as [string, Destination[]];
    })
    .filter(([country, items]) => {
      if (!normalizedSearch) return items.length > 0;
      return country.toLowerCase().includes(normalizedSearch) || items.length > 0;
    });

  return (
    <div ref={wrapperRef} className="compare-picker">
      {label ? (
        <label className="compare-selector-label" style={{ color: accentColor }}>
          {label}
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="compare-picker-trigger"
      >
        {value ? value.name : "-- Choisir --"}
      </button>

      {open && (
        <div className="compare-picker-panel">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un pays ou une université..."
            className="compare-picker-search"
          />

          {filteredFavorites.length > 0 && (
            <div className="compare-picker-section">
              <div className="compare-picker-section-title">Favoris</div>
              <div className="compare-picker-sublist">
                {filteredFavorites.map((dest) => (
                  <button
                    key={`fav-${dest.id}`}
                    type="button"
                    className="compare-picker-item"
                    onClick={() => {
                      onSelect(dest);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    {dest.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredCountries.map(([country, items]) => (
            <div key={country} className="compare-picker-section">
              <button
                type="button"
                onClick={() => toggleCountry(country)}
                className="compare-picker-country-button"
              >
                <span>{country}</span>
                <span>{normalizedSearch ? "•" : openCountries[country] ? "▲" : "▼"}</span>
              </button>

              {(normalizedSearch || openCountries[country]) && (
                <div className="compare-picker-sublist">
                  {items.map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      className="compare-picker-item"
                      onClick={() => {
                        onSelect(dest);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <div className="compare-picker-item-title">{dest.name}</div>
                      <div className="compare-picker-item-sub">
                        {dest.location}, {dest.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredFavorites.length === 0 && filteredCountries.length === 0 && (
            <div className="compare-picker-empty">Aucun résultat.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [selectedDestinations, setSelectedDestinations] = useState<
    Array<Destination | null>
  >([null, null]);
  const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(new Set());
  const [aiState, setAiState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiError, setAiError] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [followupMessages, setFollowupMessages] = useState<ChatMessage[]>([]);
  const [followupInput, setFollowupInput] = useState("");
  const [followupState, setFollowupState] = useState<"idle" | "loading" | "error">(
    "idle"
  );
  const [followupError, setFollowupError] = useState("");

  const analysisRef = useRef<HTMLElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function refreshFavorites() {
      setFavoriteIds(readFavoriteIdsFromStorage());
    }

    refreshFavorites();
    window.addEventListener("focus", refreshFavorites);
    window.addEventListener("storage", refreshFavorites);

    return () => {
      window.removeEventListener("focus", refreshFavorites);
      window.removeEventListener("storage", refreshFavorites);
    };
  }, []);

  useEffect(() => {
    if (aiState !== "loading") return;

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [aiState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [followupMessages, followupState]);

  const chosenDestinations = useMemo(
    () =>
      selectedDestinations.filter(
        (dest): dest is Destination => dest !== null
      ),
    [selectedDestinations]
  );

  const uniqueIds = new Set(chosenDestinations.map((d) => d.id));

  const canCompare =
    chosenDestinations.length >= 2 &&
    uniqueIds.size === chosenDestinations.length &&
    selectedCriteria.size > 0;

  const destinationsByCountry = useMemo(() => {
    const grouped: Record<string, Destination[]> = {};

    for (const dest of destinations) {
      if (!grouped[dest.country]) grouped[dest.country] = [];
      grouped[dest.country].push(dest);
    }

    for (const country of Object.keys(grouped)) {
      grouped[country].sort((a, b) => a.name.localeCompare(b.name));
    }

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const favoriteDestinations = useMemo(() => {
    return destinations
      .filter((dest) => favoriteIds.includes(dest.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [favoriteIds]);

  const orderedSummaries = useMemo(() => {
    if (!aiResult) return [];
    return getOrderedSummaries(aiResult, chosenDestinations);
  }, [aiResult, chosenDestinations]);

  function resetAi() {
    setAiState("idle");
    setAiResult(null);
    setAiError("");
    setLoadingMessageIndex(0);
  }

  function resetFollowupChat() {
    setFollowupMessages([]);
    setFollowupInput("");
    setFollowupState("idle");
    setFollowupError("");
  }

  function toggleCriterion(label: string) {
    setSelectedCriteria((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
    resetAi();
    resetFollowupChat();
  }

  function selectAllCriteria() {
    const all = new Set<string>();
    for (const group of Object.values(CRITERIA_GROUPS)) {
      for (const label of Object.keys(group)) all.add(label);
    }
    setSelectedCriteria(all);
    resetAi();
    resetFollowupChat();
  }

  function clearAllCriteria() {
    setSelectedCriteria(new Set());
    resetAi();
    resetFollowupChat();
  }

  function updateSelectedDestination(index: number, destination: Destination | null) {
    setSelectedDestinations((prev) => {
      const next = [...prev];
      next[index] = destination;
      return next;
    });
    resetAi();
    resetFollowupChat();
  }

  function addDestinationSlot() {
    setSelectedDestinations((prev) => [...prev, null]);
    resetAi();
    resetFollowupChat();
  }

  function removeDestinationSlot(index: number) {
    setSelectedDestinations((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
    resetAi();
    resetFollowupChat();
  }

  async function handleAI() {
    if (!canCompare) return;

    setAiState("loading");
    setAiResult(null);
    setAiError("");
    setLoadingMessageIndex(0);
    resetFollowupChat();

    window.setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    const criteriaWithGroups: Array<{ group: string; label: string }> = [];
    for (const [group, criteria] of Object.entries(CRITERIA_GROUPS)) {
      for (const label of Object.keys(criteria)) {
        if (selectedCriteria.has(label)) {
          criteriaWithGroups.push({ group, label });
        }
      }
    }

    try {
      const [textResult, tableRows] = await Promise.all([
        callOllamaMultiCompare(chosenDestinations, [...selectedCriteria]),
        callOllamaMultiTable(chosenDestinations, criteriaWithGroups),
      ]);

      setAiResult({
        ...textResult,
        tableRows,
      });
      setAiState("done");
    } catch (e) {
      setAiState("error");
      setAiError(e instanceof Error ? e.message : "Erreur de connexion à Ollama");
    }
  }

  async function handleFollowupAsk() {
    const question = followupInput.trim();
    if (!question || !aiResult || chosenDestinations.length < 2) return;

    const nextMessages = [
      ...followupMessages,
      { role: "user" as const, content: question },
    ];

    setFollowupMessages(nextMessages);
    setFollowupInput("");
    setFollowupState("loading");
    setFollowupError("");

    try {
      const answer = await callOllamaFollowup(
        chosenDestinations,
        [...selectedCriteria],
        aiResult,
        nextMessages,
        question
      );

      setFollowupMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer || "Je n’ai pas pu formuler de réponse utile." },
      ]);
      setFollowupState("idle");
    } catch (e) {
      setFollowupState("error");
      setFollowupError(e instanceof Error ? e.message : "Erreur de connexion à Ollama");
    }
  }

  return (
    <main className="compare-page">
      <section className="compare-hero">
        <div className="compare-hero-badge">Comparateur IA</div>
        <h1 className="compare-hero-title">Comparateur de destinations</h1>
        <p className="compare-hero-text">
          Sélectionnez plusieurs destinations, choisissez vos critères
          prioritaires, obtenez une analyse détaillée, puis posez quelques
          questions de suivi sur cette comparaison.
        </p>
      </section>

      <SectionCard>
        <div className="compare-section-header">
          <div>
            <h2 className="compare-section-title">1. Choisissez vos destinations</h2>
            <p className="compare-section-text">
              Favoris en haut, puis classement par pays et universités.
            </p>
          </div>
        </div>

        <div className="compare-selector-list">
          {selectedDestinations.map((dest, index) => {
            const excludedIds = selectedDestinations
              .filter((_, i) => i !== index)
              .filter((item): item is Destination => item !== null)
              .map((item) => item.id);

            return (
              <div key={index} className="compare-selector-block">
                <div className="compare-selector-top-row">
                  <label
                    className={`compare-selector-label ${
                      index === 0
                        ? "compare-selector-label--red"
                        : index === 1
                        ? "compare-selector-label--blue"
                        : "compare-selector-label--green"
                    }`}
                  >
                    Destination {index + 1}
                  </label>

                  {selectedDestinations.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeDestinationSlot(index)}
                      className="compare-remove-button"
                    >
                      Retirer
                    </button>
                  )}
                </div>

                <DestinationPicker
                  label=""
                  value={dest}
                  onSelect={(selectedDest) =>
                    updateSelectedDestination(index, selectedDest)
                  }
                  excludedIds={excludedIds}
                  destinationsByCountry={destinationsByCountry}
                  favorites={favoriteDestinations}
                  accentColor="var(--green-dark)"
                />

                <DestPreview dest={dest} />
              </div>
            );
          })}
        </div>

        <div className="compare-add-row">
          <button
            type="button"
            onClick={addDestinationSlot}
            className="compare-secondary-button"
          >
            + Ajouter une destination
          </button>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="compare-section-header">
          <div>
            <h2 className="compare-section-title">2. Sélectionnez vos critères cruciaux</h2>
            <p className="compare-section-text">
              Cochez ce qui compte vraiment pour votre choix.
            </p>
          </div>

          <div className="compare-top-actions">
            <button type="button" onClick={selectAllCriteria} className="compare-text-button">
              Tout cocher
            </button>
            <button type="button" onClick={clearAllCriteria} className="compare-text-button">
              Tout décocher
            </button>
            <span className="compare-counter">
              {selectedCriteria.size} critère{selectedCriteria.size > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="compare-criteria-grid">
          {Object.entries(CRITERIA_GROUPS).map(([group, criteria]) => (
            <CriteriaGroup
              key={group}
              groupName={group}
              criteria={criteria}
              selected={selectedCriteria}
              onToggle={toggleCriterion}
            />
          ))}
        </div>

        <div className="compare-cta-row">
          <button
            type="button"
            onClick={handleAI}
            disabled={!canCompare || aiState === "loading"}
            className="compare-primary-button"
          >
            {aiState === "loading" ? "Analyse en cours…" : "Analyser avec l’IA Ollama"}
          </button>

          {!canCompare && (
            <span className="compare-hint">
              {chosenDestinations.length < 2
                ? "Sélectionnez au moins deux destinations différentes"
                : uniqueIds.size !== chosenDestinations.length
                ? "Choisissez des destinations différentes"
                : "Cochez au moins un critère"}
            </span>
          )}
        </div>
      </SectionCard>

      {(aiState === "loading" || aiState === "done" || aiState === "error") && (
        <SectionCard className="compare-analysis-card">
          <section ref={analysisRef}>
            <h2 className="compare-section-title">3. Analyse IA</h2>

            {aiState === "loading" && (
              <div className="compare-loading-box">
                <div className="compare-loading-dot" />
                <div>
                  <div className="compare-loading-title">
                    Ollama analyse la comparaison…
                  </div>
                  <div className="compare-loading-text">
                    {ANALYSIS_MESSAGES[loadingMessageIndex]}
                  </div>
                </div>
              </div>
            )}

            {aiState === "error" && (
              <div className="compare-error-box">
                <strong>Erreur de connexion à Ollama</strong>
                <p style={{ margin: "0.65rem 0 0" }}>{aiError}</p>
                <p style={{ margin: "0.65rem 0 0", color: "var(--text-soft)" }}>
                  Vérifiez que <code>ollama serve</code> est lancé et que le modèle
                  <code> llama3</code> est disponible.
                </p>
              </div>
            )}

            {aiState === "done" && aiResult && (
              <>
                <div className="compare-ranking-box">
                  <div className="compare-verdict-title">Classement proposé</div>
                  <div className="compare-ranking-list">
                    {aiResult.ranking.map((name, index) => (
                      <span key={name} className="compare-rank-chip">
                        #{index + 1} {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="compare-analysis-grid">
                  {orderedSummaries.map((summary, index) => (
                    <div key={summary.name} className="compare-analysis-col">
                      <div
                        className={`compare-analysis-header ${
                          index === 0
                            ? "compare-analysis-header--red"
                            : index === 1
                            ? "compare-analysis-header--blue"
                            : "compare-analysis-header--green"
                        }`}
                      >
                        {summary.name}
                      </div>
                      <div className="compare-analysis-body">{summary.analysis || "—"}</div>
                    </div>
                  ))}
                </div>

                <div className="compare-verdict-box">
                  <div className="compare-verdict-title">Verdict global</div>
                  <div className="compare-verdict-body">{aiResult.verdict || "—"}</div>
                </div>

                <div className="compare-divider">Détail par critère</div>

                <MultiCompareTable
                  selectedDestinations={chosenDestinations}
                  tableRows={aiResult.tableRows}
                />
              </>
            )}
          </section>
        </SectionCard>
      )}

      {aiState === "done" && aiResult && (
        <SectionCard>
          <h2 className="compare-section-title">4. Questions rapides sur cette comparaison</h2>
          <p className="compare-section-text">
            Petit suivi contextuel sur la comparaison en cours, sans remplacer la page chatbot principale.
          </p>

          <div className="compare-chat-box">
            {followupMessages.length === 0 && (
              <div className="compare-chat-hint">
                Exemples : “Laquelle semble la plus adaptée si je privilégie la langue ?”
                ou “Quelle destination paraît la plus équilibrée ?”
              </div>
            )}

            {followupMessages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "compare-chat-message-user"
                    : "compare-chat-message-assistant"
                }
              >
                <div className="compare-chat-role">
                  {message.role === "user" ? "Vous" : "Assistant comparaison"}
                </div>
                <div>{message.content}</div>
              </div>
            ))}

            {followupState === "loading" && (
              <div className="compare-chat-message-assistant">
                <div className="compare-chat-role">Assistant comparaison</div>
                <div>Je réfléchis à partir de la comparaison actuelle…</div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="compare-chat-composer">
            <textarea
              value={followupInput}
              onChange={(e) => setFollowupInput(e.target.value)}
              placeholder="Posez une question complémentaire sur cette comparaison…"
              className="compare-textarea"
              rows={3}
            />
            <div className="compare-chat-actions">
              <button
                type="button"
                onClick={handleFollowupAsk}
                disabled={!followupInput.trim() || followupState === "loading"}
                className="compare-primary-button"
              >
                Envoyer
              </button>
            </div>

            {followupState === "error" && (
              <div className="compare-error-inline">
                {followupError || "Erreur lors de la question complémentaire."}
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </main>
  );
}