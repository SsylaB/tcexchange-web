import type { AiResult, ChatMessage, Destination, TableRow } from "../types/compare";
import { stripMarkdown, safeParseJson } from "./compareUtils";

async function ollamaGenerate(prompt: string) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3", prompt, stream: false }),
  });

  if (!response.ok) throw new Error(`Ollama error ${response.status}`);

  const data = await response.json();
  return String(data.response || "");
}

export async function callOllamaMultiCompare(
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

export async function callOllamaMultiTable(
  selectedDestinations: Destination[],
  criteriaWithGroups: Array<{ group: string; label: string }>
): Promise<TableRow[]> {
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
    const parts = (linesOut[index] || "").split(";").map((v) => v.trim());
    const matches = selectedDestinations.map((_, destIndex) =>
      /oui|yes|true/.test(parts[destIndex] || "")
    );
    return { group: criterion.group, label: criterion.label, matches };
  });
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
