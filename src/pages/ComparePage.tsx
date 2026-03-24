import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import rawData from "../data/destinations.json";
import "../styles/ComparePage.css";

import type { AiResult, ChatMessage, CriteriaGroupMap, Destination } from "../types/compare";
import { callOllamaMultiCompare, callOllamaMultiTable, callOllamaFollowup } from "../utils/ollama";
import { normalizeExchangeType, getOrderedSummaries } from "../utils/compareUtils";
import { useFavorites } from "../context/FavoritesContext";
import CriteriaGroup from "../components/CriteriaGroup";
import MultiCompareTable from "../components/MultiCompareTable";
import DestinationPicker from "../components/DestinationPicker";

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

const CRITERIA_GROUPS: Record<string, CriteriaGroupMap> = {
  "Type d'échange" : {
    "Erasmus+": ["erasmus"],
    "Bilatéral": ["bilateral"],
    "Double Diplôme": ["dd"],
  },
  Budget: {
    "Petit budget (-1000 euros)": ["budget-mid"],
    "Budget élevé": ["budget-high"],
  },
  Géographie : {
    "Proche de Lyon": ["close"],
    "Destination lointaine": ["far"],
  },
  Langues : {
    Anglais: ["en"],
    Espagnol: ["es"],
    Allemand: ["de"],
    Italien: ["it"],
    "Langue asiatique": ["asia-lang"],
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
  "Évaluation des langues, du type d'échange et du cadre de vie…",
  "Comparaison des points forts académiques…",
  "Construction d'un verdict argumenté…",
  "Finalisation de la synthèse…",
];

const rawDestinations = rawData as RawDestination[];

const destinations: Destination[] = rawDestinations.map((d) => ({
  id: d.id,
  country: d.country ?? "",
  name: d.universityName ?? "",
  dest: `${d.location ?? ""}, ${d.country ?? ""}`,
  type: normalizeExchangeType(d.exchangeType ?? ""),
  bg: "var(--surface)",
  features: d.languages ?? [],
  description: d.description ?? "",
  location: d.location ?? "",
  url: d.url ?? "",
  languages: d.languages ?? [],
  shortName: d.shortName ?? "",
  rawExchangeType: d.exchangeType ?? "",
}));

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
    <div className="compare-preview-card" style={{ background: dest.bg || "var(--surface)" }}>
      <div>
        <div className="compare-preview-name">{dest.name}</div>
        <div className="compare-preview-country">{dest.dest}</div>
        <div className="compare-preview-badge">{dest.type}</div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { favorites: favoriteIds } = useFavorites();

  const [selectedDestinations, setSelectedDestinations] = useState<Array<Destination | null>>(
    [null, null]
  );
  const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(new Set());
  const [aiState, setAiState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiError, setAiError] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [followupMessages, setFollowupMessages] = useState<ChatMessage[]>([]);
  const [followupInput, setFollowupInput] = useState("");
  const [followupState, setFollowupState] = useState<"idle" | "loading" | "error">("idle");
  const [followupError, setFollowupError] = useState("");

  const analysisRef = useRef<HTMLElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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
    () => selectedDestinations.filter((dest): dest is Destination => dest !== null),
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

  const favoriteDestinations = useMemo(
    () => destinations.filter((dest) => favoriteIds.includes(dest.id)).sort((a, b) => a.name.localeCompare(b.name)),
    [favoriteIds]
  );

  const orderedSummaries = useMemo(
    () => (aiResult ? getOrderedSummaries(aiResult, chosenDestinations) : []),
    [aiResult, chosenDestinations]
  );

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

  function reset() {
    resetAi();
    resetFollowupChat();
  }

  function toggleCriterion(label: string) {
    setSelectedCriteria((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
    reset();
  }

  function selectAllCriteria() {
    const all = new Set<string>();
    for (const group of Object.values(CRITERIA_GROUPS)) {
      for (const label of Object.keys(group)) all.add(label);
    }
    setSelectedCriteria(all);
    reset();
  }

  function clearAllCriteria() {
    setSelectedCriteria(new Set());
    reset();
  }

  function updateSelectedDestination(index: number, destination: Destination | null) {
    setSelectedDestinations((prev) => {
      const next = [...prev];
      next[index] = destination;
      return next;
    });
    reset();
  }

  function addDestinationSlot() {
    setSelectedDestinations((prev) => [...prev, null]);
    reset();
  }

  function removeDestinationSlot(index: number) {
    setSelectedDestinations((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
    reset();
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
        if (selectedCriteria.has(label)) criteriaWithGroups.push({ group, label });
      }
    }

    try {
      const [textResult, tableRows] = await Promise.all([
        callOllamaMultiCompare(chosenDestinations, [...selectedCriteria]),
        callOllamaMultiTable(chosenDestinations, criteriaWithGroups),
      ]);
      setAiResult({ ...textResult, tableRows });
      setAiState("done");
    } catch (e) {
      setAiState("error");
      setAiError(e instanceof Error ? e.message : "Erreur de connexion à Ollama");
    }
  }

  async function handleFollowupAsk() {
    const question = followupInput.trim();
    if (!question || !aiResult || chosenDestinations.length < 2) return;

    const nextMessages = [...followupMessages, { role: "user" as const, content: question }];
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
        { role: "assistant", content: answer || "Je n'ai pas pu formuler de réponse utile." },
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
        <div className="compare-hero-badge">TComparateur </div>
        <h1 className="compare-hero-title">Comparateur de destinations</h1>
        <p className="compare-hero-text">
          Sélectionnez plusieurs destinations, choisissez vos critères prioritaires, obtenez une
          analyse détaillée, puis posez quelques questions de suivi sur cette comparaison.
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
                  onSelect={(selectedDest) => updateSelectedDestination(index, selectedDest)}
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
          <button type="button" onClick={addDestinationSlot} className="compare-secondary-button">
            + Ajouter une destination
          </button>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="compare-section-header">
          <div>
            <h2 className="compare-section-title">2. Sélectionnez vos critères cruciaux</h2>
            <p className="compare-section-text">Cochez ce qui compte vraiment pour votre choix.</p>
          </div>
          <div className="compare-top-actions">
            <button type="button" onClick={selectAllCriteria} className="compare-text-button">
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
            {aiState === "loading" ? "Analyse en cours…" : "Lancer le comparateur"}
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
                  <div className="compare-loading-title">Ollama analyse la comparaison…</div>
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
            Petit suivi contextuel sur la comparaison en cours, sans remplacer la page chatbot
            principale.
          </p>

          <div className="compare-chat-box">
            {followupMessages.length === 0 && (
              <div className="compare-chat-hint">
                Exemples : "Laquelle semble la plus adaptée si je privilégie la langue ?" ou
                "Quelle destination paraît la plus équilibrée ?"
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
