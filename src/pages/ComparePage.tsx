import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

// --- UNIQUE IMPORT CSS ---
import "../styles/Compare/ComparePage.css";

// --- TYPES & UTILS ---
import type { AiResult, ChatMessage } from "../types/compare";
import { callOllamaMultiCompare, callOllamaFollowup } from "../utils/ollama";
import { normalizeExchangeType } from "../utils/compareUtils";
import { computeTableRows } from "../utils/criteriaMatch";
import { useFavorites } from "../context/FavoritesContext";

// --- COMPOSANTS ---
import MultiCompareTable from "../components/MultiCompareTable";
import DestinationPicker from "../components/DestinationPicker";

import type { Destination, DestinationRaw } from "../types";

const CRITERIA_GROUPS: Record<string, Record<string, string[]>> = {
    "Type d'échange": {
        "Erasmus+": ["erasmus"],
        Bilatéral: ["bilateral"],
        "Double Diplôme": ["dd"],
    },
    Budget: {
        "Petit budget (-1000 euros)": ["budget-mid"],
        "Budget élevé": ["budget-high"],
    },
    Langues: {
        Anglais: [],
        Espagnol: [],
        Allemand: [],
        Italien: [],
        Russe: [],
        Japonais: [],
        Coréen: [],
        Arabe: [],
        "Mandarin/Chinois": [],
    },
    UE: {
        "Mathématiques et Signal": ["math-signal"],
        "Réseaux et Télécoms": ["net-telecom"],
        "Informatique et Logiciels": ["info-soft"],
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
    Géographie: {
        "Proche de Lyon": ["close"],
        "Destination lointaine": ["far"],
    },
    "Cadre de vie": {
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
    },
};

function groupSlug(name: string): string {
    const map: Record<string, string> = {
        "Type d'échange": "type",
        Budget: "budget",
        Géographie: "geo",
        Langues: "lang",
        Académique: "acad",
        "Cadre de vie": "cadre",
        Expérience: "exp",
    };
    return map[name] ?? "exp";
}

function mapDestination(d: DestinationRaw): Destination {
    const langs = d.languages
        ? d.languages.split(",").map((l) => l.trim())
        : [];
    return {
        id: d.id,
        country: d.country ?? "",
        name: d.university_name ?? "",
        dest: `${d.location ?? ""}, ${d.country ?? ""}`,
        type: normalizeExchangeType(d.exchange_type ?? ""),
        features: langs,
        description: d.description ?? "",
        location: d.location ?? "",
        url: d.url ?? "",
        languages: langs,
        shortName: d.short_name ?? "",
        rawExchangeType: d.exchange_type ?? "",
    };
}

function SectionCard({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={`compare-card ${className}`.trim()}>
            {children}
        </section>
    );
}

export default function ComparePage() {
    const { favorites: favoriteIds } = useFavorites();

    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [selectedDestinations, setSelectedDestinations] = useState<
        Array<Destination | null>
    >([null, null]);
    const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(
        new Set(),
    );
    const [aiState, setAiState] = useState<
        "idle" | "loading" | "done" | "error"
    >("idle");
    const [aiResult, setAiResult] = useState<AiResult | null>(null);
    const [aiError, setAiError] = useState("");
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [followupMessages, setFollowupMessages] = useState<ChatMessage[]>([]);
    const [followupInput, setFollowupInput] = useState("");
    const [followupState, setFollowupState] = useState<
        "idle" | "loading" | "error"
    >("idle");

    const analysisRef = useRef<HTMLElement | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Appel vers ton API Rust
        fetch("/api/destinations")
            .then((res) => res.json())
            .then((data: DestinationRaw[]) =>
                setDestinations(data.map(mapDestination)),
            )
            .catch(console.error);
    }, []);

    const chosenDestinations = useMemo(
        () =>
            selectedDestinations.filter(
                (dest): dest is Destination => dest !== null,
            ),
        [selectedDestinations],
    );

    const ANALYSIS_MESSAGES = useMemo(() => {
        return [
            "Je compare tes destinations pour te faire une reco vraiment utile…",
            "Je croise les données avec tes critères prioritaires…",
            "Je pèse les points forts et les points de vigilance…",
            "Encore quelques secondes, je finalise le verdict…",
        ];
    }, []);

    useEffect(() => {
        if (aiState !== "loading") return;
        const interval = window.setInterval(() => {
            setLoadingMessageIndex(
                (prev) => (prev + 1) % ANALYSIS_MESSAGES.length,
            );
        }, 1800);
        return () => window.clearInterval(interval);
    }, [aiState, ANALYSIS_MESSAGES]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [followupMessages, followupState]);

    const canCompare =
        chosenDestinations.length >= 2 && selectedCriteria.size > 0;

    const destinationsByCountry = useMemo(() => {
        const grouped: Record<string, Destination[]> = {};
        for (const dest of destinations) {
            if (!grouped[dest.country]) grouped[dest.country] = [];
            grouped[dest.country].push(dest);
        }
        return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    }, [destinations]);

    const favoriteDestinations = useMemo(
        () => destinations.filter((dest) => favoriteIds.includes(dest.id)),
        [favoriteIds, destinations],
    );

    function resetAi() {
        setAiState("idle");
        setAiResult(null);
        setAiError("");
    }

    function toggleCriterion(label: string) {
        setSelectedCriteria((prev) => {
            const next = new Set(prev);
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });
        resetAi();
    }

    function selectAllCriteria() {
        const all = new Set<string>();
        for (const group of Object.values(CRITERIA_GROUPS)) {
            for (const label of Object.keys(group)) all.add(label);
        }
        setSelectedCriteria(all);
        resetAi();
    }

    function clearAllCriteria() {
        setSelectedCriteria(new Set());
        resetAi();
    }

    function updateSelectedDestination(
        index: number,
        destination: Destination | null,
    ) {
        setSelectedDestinations((prev) => {
            const next = [...prev];
            next[index] = destination;
            return next;
        });
        resetAi();
    }

    async function handleAI() {
        if (!canCompare) return;
        setAiState("loading");
        setAiResult(null);
        setAiError("");

        analysisRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        const criteriaList: Array<{ group: string; label: string }> = [];
        for (const [group, criteria] of Object.entries(CRITERIA_GROUPS)) {
            for (const label of Object.keys(criteria)) {
                if (selectedCriteria.has(label)) {
                    criteriaList.push({ group, label });
                }
            }
        }

        try {
            // ✅ APPEL VIA LE PONT VERS LE BACKEND RUST
            const textResult = await callOllamaMultiCompare(
                chosenDestinations,
                Array.from(selectedCriteria),
            );
            const textSummaries: Record<string, string> = {};
            for (const s of textResult.destinationSummaries ?? []) {
                if (s.name && s.analysis) textSummaries[s.name] = s.analysis;
            }
            // ✅ CONSTRUCTION DES LIGNES DU TABLEAU VIA criteriaMatch.ts
            const tableRows = computeTableRows(
                chosenDestinations,
                criteriaList,
                textSummaries,
            );

            setAiResult({ ...textResult, tableRows });
            setAiState("done");
        } catch (e: any) {
            setAiState("error");
            if (e.message === "QUOTA_EXCEEDED" || e.message?.includes("429")) {
                setAiError(
                    "L'assistant IA a atteint sa limite quotidienne de réflexion ! 😴 Il sera de nouveau disponible demain matin.",
                );
            } else {
                setAiError(
                    e instanceof Error
                        ? e.message
                        : "Erreur de connexion avec l'IA.",
                );
            }
        }
    }

    async function handleFollowupAsk() {
        console.log("followup triggered", { followupInput, aiResult }); // 👈
        const question = followupInput.trim();
        if (!question || !aiResult) return;
        const nextMessages = [
            ...followupMessages,
            { role: "user" as const, content: question },
        ];
        setFollowupMessages(nextMessages);
        setFollowupInput("");
        setFollowupState("loading");

        try {
            // ✅ APPEL CHAT VIA LE PONT VERS LE BACKEND RUST
            const answer = await callOllamaFollowup(
                chosenDestinations,
                Array.from(selectedCriteria),
                aiResult,
                nextMessages,
                question,
            );
            setFollowupMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: answer || "Désolé, pas de réponse.",
                },
            ]);
            setFollowupState("idle");
        } catch (e) {
            console.error("followup error:", e);
            setFollowupState("error");
        }
    }

    return (
        <main className="compare-page">
            <section className="compare-hero card-base--rainbow">
                <div className="compare-hero-badge">TComparateur</div>
                <h1 className="compare-hero-title">
                    Comparateur de destinations pour votre échange TC !
                </h1>
                <p className="compare-hero-text">
                    Sélectionnez plusieurs destinations, choisissez vos critères
                    prioritaires et obtenez une analyse détaillée.
                </p>
            </section>

            <SectionCard>
                <h2 className="compare-section-title">
                    1. Choisissez vos destinations
                </h2>
                <div className="compare-selector-list">
                    {selectedDestinations.map((dest, index) => (
                        <div key={index} className="compare-selector-block">
                            <label
                                className={`compare-selector-label ${dest ? "is-selected" : ""}`}
                            >
                                Destination {index + 1}
                            </label>
                            <DestinationPicker
                                label=""
                                value={dest}
                                onSelect={(d) =>
                                    updateSelectedDestination(index, d)
                                }
                                excludedIds={selectedDestinations
                                    .filter((_, i) => i !== index)
                                    .filter((d): d is Destination => d !== null)
                                    .map((d) => d.id)}
                                destinationsByCountry={destinationsByCountry}
                                favorites={favoriteDestinations}
                                accentColor="var(--green-dark)"
                            />
                        </div>
                    ))}
                </div>
                <div className="compare-add-row">
                    <button
                        type="button"
                        onClick={() =>
                            setSelectedDestinations([
                                ...selectedDestinations,
                                null,
                            ])
                        }
                        className="compare-secondary-button"
                    >
                        + Ajouter une destination
                    </button>
                </div>
            </SectionCard>

            <SectionCard>
                <div className="compare-section-header">
                    <h2 className="compare-section-title">
                        2. Sélectionnez vos critères
                    </h2>
                    <div className="compare-top-actions">
                        <button
                            type="button"
                            onClick={selectAllCriteria}
                            className="compare-control-button"
                        >
                            Tout cocher
                        </button>
                        <button
                            type="button"
                            onClick={clearAllCriteria}
                            className="compare-control-button"
                        >
                            Tout décocher
                        </button>
                        <span className="compare-counter">
                            {selectedCriteria.size} critères
                        </span>
                    </div>
                </div>
                <div className="compare-criteria-pills-container">
                    {Object.entries(CRITERIA_GROUPS).map(
                        ([group, criteria]) => (
                            <div
                                key={group}
                                className="compare-criteria-pill-group"
                            >
                                <div
                                    className={`compare-criteria-pill-header compare-criteria-pill-header--${groupSlug(group)}`}
                                >
                                    {group}
                                </div>
                                <div className="compare-criteria-pill-list">
                                    {Object.keys(criteria).map((label) => (
                                        <button
                                            key={label}
                                            onClick={() =>
                                                toggleCriterion(label)
                                            }
                                            className={`compare-criteria-pill ${selectedCriteria.has(label) ? `compare-criteria-pill--active compare-criteria-pill--active-${groupSlug(group)}` : ""}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ),
                    )}
                </div>
                <div className="compare-cta-row">
                    <button
                        onClick={handleAI}
                        disabled={!canCompare || aiState === "loading"}
                        className="compare-primary-button"
                    >
                        {aiState === "loading"
                            ? "Analyse en cours…"
                            : "Lancer le comparateur"}
                    </button>
                </div>
            </SectionCard>

            {(aiState === "loading" ||
                aiState === "done" ||
                aiState === "error") && (
                <SectionCard className="compare-analysis-card">
                    <section ref={analysisRef}>
                        <h2 className="compare-section-title">3. Analyse IA</h2>

                        {aiState === "loading" && (
                            <div className="compare-loading-box">
                                <div className="compare-loading-dot" />
                                <div>
                                    <div className="compare-loading-title">
                                        Analyse intelligente en cours…
                                    </div>
                                    <div className="compare-loading-text">
                                        {ANALYSIS_MESSAGES[loadingMessageIndex]}
                                    </div>
                                </div>
                            </div>
                        )}

                        {aiState === "error" && (
                            <div className="compare-error-box">
                                <strong>Erreur</strong>
                                <p>{aiError}</p>
                            </div>
                        )}

                        {aiState === "done" && aiResult && (
                            <>
                                <div className="compare-ranking-box">
                                    <div className="compare-verdict-title">
                                        Classement proposé
                                    </div>
                                    <div className="compare-ranking-list">
                                        {aiResult.ranking.map((name, index) => (
                                            <div
                                                key={name}
                                                className={`compare-rank-card rank-card--${index}`}
                                            >
                                                <div className="rank-number">
                                                    #{index + 1}
                                                </div>
                                                <div className="rank-univ-name">
                                                    {name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="compare-verdict-box">
                                    <div className="compare-verdict-header">
                                        <span className="verdict-icon">✨</span>
                                        <h3 className="compare-verdict-title">
                                            L'avis de ton assistant TC
                                        </h3>
                                    </div>
                                    <div className="compare-verdict-body">
                                        {aiResult.verdict ||
                                            "Analyse indisponible pour le moment."}
                                    </div>
                                </div>

                                <div className="compare-divider">
                                    Détail par critère
                                </div>

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
                    <h2 className="compare-section-title">
                        4. Questions sur cette comparaison
                    </h2>

                    {(followupMessages.length > 0 ||
                        followupState === "loading") && (
                        <div className="compare-chat-box">
                            {followupMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={
                                        msg.role === "user"
                                            ? "compare-chat-message-user"
                                            : "compare-chat-message-assistant"
                                    }
                                >
                                    <div className="compare-chat-role">
                                        {msg.role === "user"
                                            ? "Vous"
                                            : "Assistant"}
                                    </div>
                                    <div>{msg.content}</div>
                                </div>
                            ))}
                            {followupState === "loading" && (
                                <div className="compare-chat-message-assistant">
                                    <div className="compare-chat-role">
                                        Assistant
                                    </div>
                                    <div>Je réfléchis...</div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    )}

                    <div className="compare-chat-composer">
                        <textarea
                            value={followupInput}
                            onChange={(e) => setFollowupInput(e.target.value)}
                            placeholder="Une question sur ces résultats ?"
                            className="compare-textarea"
                            rows={3}
                        />
                        <div className="compare-chat-actions">
                            <button
                                onClick={handleFollowupAsk}
                                disabled={
                                    !followupInput.trim() ||
                                    followupState === "loading"
                                }
                                className="compare-primary-button"
                            >
                                Envoyer
                            </button>
                        </div>
                    </div>
                </SectionCard>
            )}
        </main>
    );
}
