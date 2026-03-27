import { GoogleGenAI, Type } from "@google/genai";
import type { AiResult, ChatMessage, Destination } from "../types/compare";
import { stripMarkdown } from "./compareUtils";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

const MODEL_NAME = "gemini-2.5-flash";

function cleanText(value: unknown): string {
  return stripMarkdown(String(value || "")).trim();
}

async function geminiGenerateText(prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Clé API Gemini manquante. Ajoute VITE_GEMINI_API_KEY dans ton fichier .env.local");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return cleanText(response.text);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Gemini error: ${error.message}`);
    }
    throw new Error("Erreur inconnue lors de l'appel à Gemini");
  }
}

export async function callOllamaMultiCompare(
  selectedDestinations: Destination[],
  selectedCriteria: string[]
) {
  if (selectedDestinations.length < 2) {
    throw new Error("Au moins deux destinations sont requises");
  }

  const destinationNames = selectedDestinations.map((d) => d.name);

  const destinationsBlock = selectedDestinations
    .map(
      (d, i) => `DESTINATION_${i + 1}
name: ${d.name}
country: ${d.country}
location: ${d.location}
type: ${d.type}
languages: ${(d.languages || []).join(", ") || "Non précisé"}
description: ${d.description || "Non précisé"}`
    )
    .join("\n\n");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Tu es un conseiller Erasmus/échange universitaire qui parle directement à un étudiant INSA LYON en Télécommunications.
Tu compares des destinations et tu t'adresses à l'étudiant avec "tu".
Réponds en français. Sois concret, enthousiaste et utile.

Critères importants pour l'étudiant pour la comparaison :
${selectedCriteria.join(", ")}

Destinations choisies pour la comparaison :
${destinationsBlock}

Consignes :
- Parle directement à l'étudiant avec "tu" (ex: "Si tu veux une vie sociale animée, tu seras servi à Barcelone...")
- Sois comparatif et concret dans chaque analyse.
- Le verdict doit être une recommandation personnelle à l'étudiant.
- Utilise exactement les noms de destinations fournis.`,
      config: {
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
                  analysis: { type: Type.STRING },
                },
                required: ["name", "analysis"],
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

    const raw = cleanText(response.text);
    const parsed = JSON.parse(raw) as {
      destinationSummaries?: Array<{ name?: string; analysis?: string }>;
      ranking?: string[];
      verdict?: string;
    };

    const normalizedSummaries = selectedDestinations.map((d) => {
      const found = parsed.destinationSummaries?.find(
        (item) => item.name?.trim() === d.name
      );
      return {
        name: d.name,
        analysis: cleanText(found?.analysis || "Analyse indisponible."),
      };
    });

    const normalizedRanking =
      parsed.ranking?.filter((name) => destinationNames.includes(name)) || [];

    const finalRanking =
      normalizedRanking.length === selectedDestinations.length
        ? normalizedRanking
        : selectedDestinations.map((d) => d.name);

    return {
      destinationSummaries: normalizedSummaries,
      ranking: finalRanking,
      verdict: cleanText(parsed.verdict || "Aucun verdict généré."),
    };
  } catch (error) {
    const fallbackText =
      error instanceof Error ? error.message : "Aucun verdict généré.";

    return {
      destinationSummaries: selectedDestinations.map((d) => ({
        name: d.name,
        analysis: "Analyse indisponible.",
      })),
      ranking: selectedDestinations.map((d) => d.name),
      verdict: cleanText(fallbackText),
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
    .map(
      (d) =>
        `- ${d.name} (${d.dest}) | type: ${d.type} | langues: ${
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

  const prompt = `Tu es un conseiller Erasmus/échange qui parle directement à un étudiant INSA TC.
Tu réponds uniquement sur la comparaison en cours, en tutoyant l'étudiant.
Tu es concis, utile, précis. Tu n'utilises pas de markdown.
Tu ne renvoies pas vers un autre chatbot.

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

Réponds en français, en t'adressant directement à l'étudiant avec "tu", en 3 à 8 phrases maximum.`;

  return cleanText(await geminiGenerateText(prompt));
}
