import { GoogleGenAI, Type } from "@google/genai";
import type { AiResult, ChatMessage, Destination } from "../types/compare";
import { stripMarkdown } from "./compareUtils";
import "../styles/Compare/ComparePage.css";
import "../styles/Compare/CompareHero.css";
import "../styles/Compare/CompareSelector.css";
import "../styles/Compare/CompareCriteria.css";
import "../styles/Compare/CompareResults.css";
import "../styles/Compare/CompareTable.css";
import "../styles/Compare/CompareChats.css";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

const MODEL_NAME = "gemini-2.5-flash";

function cleanText(value: unknown): string {
  return stripMarkdown(String(value ?? "")).replace(/\s+/g, " ").trim();
}

function normalizeName(value: unknown): string {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function safeJoin(values: unknown, fallback = "Non précisé"): string {
  if (!Array.isArray(values) || values.length === 0) return fallback;
  return values.map((v) => cleanText(v)).filter(Boolean).join(", ") || fallback;
}

function normalizeLevel(value: unknown): "yes" | "medium" | "no" {
  const text = cleanText(value).toLowerCase();

  if (text === "yes" || text === "oui" || text === "fort" || text === "strong") {
    return "yes";
  }

  if (text === "medium" || text === "moyen" || text === "mitigé" || text === "mitige") {
    return "medium";
  }

  return "no";
}

function getDestinationLabel(destination: Destination): string {
  return cleanText(destination.name || destination.dest || "Destination");
}

function getDestinationCountry(destination: Destination): string {
  return cleanText(destination.country || "Non précisé");
}

function getDestinationLocation(destination: Destination): string {
  return cleanText(destination.location || destination.dest || "Non précisé");
}

function buildAnalysisFallback(
  destination: Destination,
  selectedCriteria: string[]
): string {
  const name = getDestinationLabel(destination);
  const criteriaSentence =
    selectedCriteria.length > 0
      ? `Par rapport à tes critères (${selectedCriteria.join(", ")}),`
      : "Globalement,";

  return cleanText(
    `${criteriaSentence} ${name} reste une option crédible.
    Je n'ai pas reçu une analyse suffisamment exploitable pour cette destination,
    mais elle mérite d'être comparée plus en détail avant de l'écarter.`
  );
}

function buildVerdictFallback(
  destinations: Destination[],
  selectedCriteria: string[]
): string {
  const names = destinations.map(getDestinationLabel);
  const intro =
    names.length >= 2
      ? `Parmi ${names.join(", ")}, il faut surtout arbitrer selon ton style de mobilité.`
      : "Il faut surtout arbitrer selon ton style de mobilité.";

  const criteriaText =
    selectedCriteria.length > 0
      ? `Tes critères clés sont : ${selectedCriteria.join(", ")}.`
      : "Tu peux surtout départager selon la langue, le cadre de vie et l'équilibre études/vie sur place.";

  return cleanText(
    `${intro} ${criteriaText}
    Regarde en priorité la cohérence entre le cadre de vie, la langue, le type de destination et ce que tu veux vraiment vivre pendant ton échange.`
  );
}

function extractFirstJsonObject(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "{}";

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(extractFirstJsonObject(raw)) as T;
  } catch {
    return null;
  }
}

async function geminiGenerateText(prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "Clé API Gemini manquante. Ajoute VITE_GEMINI_API_KEY dans ton fichier .env.local"
    );
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    return cleanText(response.text);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Gemini error: ${error.message}`);
    }
    throw new Error("Erreur inconnue lors de l'appel à Gemini");
  }
}

type CompareResponse = {
  destinationSummaries?: Array<{
    name?: string;
    shortIntro?: string;
    criteriaBreakdown?: Array<{
      criterion?: string;
      level?: string;
      assessment?: string;
    }>;
    bestFor?: string;
  }>;
  ranking?: string[];
  verdict?: string;
};

type CompareResultWithRawCriteria = Omit<AiResult, "tableRows"> & {
  rawCriteria?: CompareResponse["destinationSummaries"];
};

export async function callOllamaMultiCompare(
  selectedDestinations: Destination[],
  selectedCriteria: string[]
): Promise<CompareResultWithRawCriteria> {
  if (selectedDestinations.length < 2) {
    throw new Error("Au moins deux destinations sont requises");
  }

  if (!apiKey) {
    return {
      destinationSummaries: selectedDestinations.map((d) => ({
        name: getDestinationLabel(d),
        analysis: buildAnalysisFallback(d, selectedCriteria),
      })),
      ranking: selectedDestinations.map((d) => getDestinationLabel(d)),
      verdict: buildVerdictFallback(selectedDestinations, selectedCriteria),
      rawCriteria: [],
    };
  }

  const destinationNames = selectedDestinations.map(getDestinationLabel);
  const destinationIndexBlock = destinationNames
    .map((name, index) => `${index + 1}. ${name}`)
    .join("\n");

  const destinationsBlock = selectedDestinations
    .map((d, i) => {
      const name = getDestinationLabel(d);
      return [
        `DESTINATION_${i + 1}`,
        `official_name: ${name}`,
        `country: ${getDestinationCountry(d)}`,
        `location: ${getDestinationLocation(d)}`,
        `type: ${cleanText(d.type || "Non précisé")}`,
        `languages: ${safeJoin(d.languages)}`,
        `description: ${cleanText(d.description || "Non précisé")}`,
      ].join("\n");
    })
    .join("\n\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Tu es un conseiller Erasmus/échange universitaire premium.
Tu parles directement à un étudiant INSA Lyon en Télécommunications.
Tu réponds en français, tu t'adresses toujours à lui avec "tu".

Destinations à comparer :
${destinationIndexBlock}

Données disponibles :
${destinationsBlock}

Critères prioritaires de l'étudiant :
${selectedCriteria.length > 0 ? selectedCriteria.join(", ") : "Aucun critère explicite fourni"}

Mission :
Fais une comparaison courte, nette, concrète, utile.

Règles obligatoires :
- Tu DOIS utiliser EXACTEMENT les noms officiels fournis ci-dessus dans le champ "name".
- Tu DOIS inclure TOUTES les destinations dans "destinationSummaries".
- Tu DOIS produire un classement complet dans "ranking" avec uniquement les noms exacts fournis.
- Tu ne dois inventer ni université, ni coût, ni météo, ni information absente.
- Si une information manque, dis-le de façon prudente et brève.
- Pas de longs paragraphes.
- Pas de formulation vague.
- Compare d'abord selon les critères donnés par l'étudiant.
- Fais ressortir ce qui distingue vraiment chaque destination des autres.
- Le classement doit dépendre uniquement des critères fournis.
- Si deux destinations sont proches, conserve l'ordre le plus logique selon les critères explicitement mentionnés.
- Ne change pas arbitrairement le classement.
- Base-toi d'abord sur les critères choisis, puis seulement ensuite sur les autres éléments.

Format attendu pour chaque destination :
- shortIntro : 1 phrase courte d'impression générale
- criteriaBreakdown : 2 à 5 entrées maximum
- pour chaque entrée de criteriaBreakdown :
  - criterion : nom du critère
  - level : utilise UNIQUEMENT yes, medium ou no
  - assessment : 1 phrase courte et concrète
- bestFor : 1 phrase courte sur le profil d'étudiant adapté

Consignes d'évaluation :
- yes = point fort clair
- medium = pertinent mais nuancé / correct sans être un vrai point fort
- no = faible, absent, ou peu convaincant sur ce critère

Le verdict :
- 3 à 5 phrases maximum
- il doit expliquer pourquoi le top 1 passe devant les autres
- il doit mentionner explicitement les critères les plus décisifs
- il doit être direct, utile et personnalisé`,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destinationSummaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  shortIntro: { type: Type.STRING },
                  criteriaBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criterion: { type: Type.STRING },
                        level: { type: Type.STRING },
                        assessment: { type: Type.STRING },
                      },
                      required: ["criterion", "level", "assessment"],
                    },
                  },
                  bestFor: { type: Type.STRING },
                },
                required: ["name", "shortIntro", "criteriaBreakdown", "bestFor"],
              },
            },
            ranking: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            verdict: { type: Type.STRING },
          },
          required: ["destinationSummaries", "ranking", "verdict"],
        },
      },
    });

    const rawText = String(response.text ?? "").trim();
    const parsed = safeParseJson<CompareResponse>(rawText) ?? {};

    const byNormalizedName = new Map(
      (parsed.destinationSummaries ?? [])
        .filter((item) => item?.name)
        .map((item) => [normalizeName(item.name), item] as const)
    );

    const normalizedSummaries = selectedDestinations.map((destination) => {
      const exactName = getDestinationLabel(destination);
      const found = byNormalizedName.get(normalizeName(exactName));

      const shortIntro = cleanText(found?.shortIntro);
      const bestFor = cleanText(found?.bestFor);
      const criteriaBreakdown = Array.isArray(found?.criteriaBreakdown)
        ? found.criteriaBreakdown
            .map((item) => {
              const criterion = cleanText(item?.criterion);
              const assessment = cleanText(item?.assessment);
              const level = normalizeLevel(item?.level);

              if (!criterion || !assessment) return "";

              const levelLabel =
                level === "yes" ? "Fort" : level === "medium" ? "Moyen" : "Faible";

              return `• ${criterion} (${levelLabel}) : ${assessment}`;
            })
            .filter(Boolean)
        : [];

      const rebuiltAnalysis = [
        shortIntro,
        ...criteriaBreakdown.slice(0, 5),
        bestFor ? `Pour toi si : ${bestFor}.` : "",
      ]
        .filter(Boolean)
        .join("\n");

      return {
        name: exactName,
        analysis:
          rebuiltAnalysis || buildAnalysisFallback(destination, selectedCriteria),
      };
    });

    const exactNameSet = new Set(destinationNames.map(normalizeName));
    const normalizedRankingRaw = Array.isArray(parsed.ranking)
      ? parsed.ranking.map(cleanText).filter(Boolean)
      : [];

    const finalRanking = normalizedRankingRaw
      .map((name) => {
        const normalized = normalizeName(name);
        const matched = destinationNames.find(
          (officialName) => normalizeName(officialName) === normalized
        );
        return matched || null;
      })
      .filter((name): name is string => Boolean(name))
      .filter(
        (name, index, arr) =>
          exactNameSet.has(normalizeName(name)) && arr.indexOf(name) === index
      );

    const completedRanking =
      finalRanking.length === selectedDestinations.length
        ? finalRanking
        : [
            ...finalRanking,
            ...destinationNames.filter((name) => !finalRanking.includes(name)),
          ];

    const finalVerdict =
      cleanText(parsed.verdict) ||
      buildVerdictFallback(selectedDestinations, selectedCriteria);

    const normalizedRawCriteria =
      parsed.destinationSummaries?.map((summary) => ({
        name: cleanText(summary.name),
        shortIntro: cleanText(summary.shortIntro),
        bestFor: cleanText(summary.bestFor),
        criteriaBreakdown: Array.isArray(summary.criteriaBreakdown)
          ? summary.criteriaBreakdown.map((entry) => ({
              criterion: cleanText(entry.criterion),
              level: normalizeLevel(entry.level),
              assessment: cleanText(entry.assessment),
            }))
          : [],
      })) ?? [];

    return {
      destinationSummaries: normalizedSummaries,
      ranking: completedRanking,
      verdict: finalVerdict,
      rawCriteria: normalizedRawCriteria,
    };
  } catch (error) {
    const fallbackText =
      error instanceof Error ? error.message : "Aucun verdict généré.";

    return {
      destinationSummaries: selectedDestinations.map((d) => ({
        name: getDestinationLabel(d),
        analysis: buildAnalysisFallback(d, selectedCriteria),
      })),
      ranking: selectedDestinations.map((d) => getDestinationLabel(d)),
      verdict:
        cleanText(fallbackText) ||
        buildVerdictFallback(selectedDestinations, selectedCriteria),
      rawCriteria: [],
    };
  }
}

export async function callOllamaFollowup(
  selectedDestinations: Destination[],
  selectedCriteria: string[],
  aiResult: AiResult,
  messages: ChatMessage[],
  question: string
) {
  const destinationsBlock = selectedDestinations
    .map((d) => {
      const name = getDestinationLabel(d);
      const country = getDestinationCountry(d);
      const location = getDestinationLocation(d);
      const type = cleanText(d.type || "Non précisé");
      const languages = safeJoin(d.languages);
      const description = cleanText(d.description || "Non précisé");

      return `- ${name} | pays: ${country} | lieu: ${location} | type: ${type} | langues: ${languages} | description: ${description}`;
    })
    .join("\n");

  const summariesBlock = aiResult.destinationSummaries
    .map((s) => `${cleanText(s.name)}:\n${cleanText(s.analysis)}`)
    .join("\n\n");

  const historyBlock = messages
    .map((m) => `${m.role === "user" ? "Étudiant" : "Assistant"}: ${cleanText(m.content)}`)
    .join("\n");

  const prompt = `Tu es un conseiller Erasmus/échange très clair, très utile.
Tu parles directement à un étudiant INSA TC.
Tu réponds uniquement sur la comparaison en cours.
Tu tutoies toujours l'étudiant.
Tu écris sans markdown.
Tu n'inventes pas d'informations absentes.
Tu restes précis, comparatif et bref.

Destinations comparées :
${destinationsBlock}

Critères choisis :
${selectedCriteria.length > 0 ? selectedCriteria.join(", ") : "Aucun critère explicite"}

Classement actuel :
${aiResult.ranking.map(cleanText).join(" > ")}

Synthèse actuelle :
${summariesBlock}

Verdict actuel :
${cleanText(aiResult.verdict)}

Historique de la mini-conversation :
${historyBlock || "Aucun"}

Nouvelle question de l'étudiant :
${cleanText(question)}

Consignes :
- Réponds en français.
- Adresse-toi directement à l'étudiant avec "tu".
- Fais une réponse courte : 3 à 6 phrases.
- Si la question porte sur un critère, compare explicitement les destinations sur ce critère.
- Va droit au but.
- Pas de long paragraphe.
- Pas de phrases vagues.`;

  return cleanText(await geminiGenerateText(prompt));
}