import type { AiResult, ChatMessage } from "../types/compare";
import type { Destination } from "../types";
import { stripMarkdown } from "./compareUtils";

function cleanText(value: unknown): string {
    return stripMarkdown(String(value ?? "")).replace(/\s+/g, " ").trim();
}

function getDestinationLabel(d: Destination): string {
    return cleanText(d.name || d.dest || "Destination");
}

type CompareResultWithRawCriteria = Omit<AiResult, "tableRows"> & {
    rawCriteria?: unknown[];
};

export async function callOllamaMultiCompare(
    selectedDestinations: Destination[],
    selectedCriteria: string[]
): Promise<CompareResultWithRawCriteria> {
    const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            destinations: selectedDestinations.map(d => ({
                id: d.id,
                name: getDestinationLabel(d),
                country: d.country,
                location: d.location,
                type: d.type,
                languages: d.languages,
                description: d.description,
            })),
            criteria: selectedCriteria,
        }),
    });

    if (!res.ok) throw new Error(`Compare API error: ${res.status}`);

    const data = await res.json();

    // Convert criteriaBreakdown → flat analysis string for textSummaryMap
    const destinationSummaries = (data.destinationSummaries ?? []).map((s: any) => {
        const lines = [
            cleanText(s.shortIntro),
            ...(s.criteriaBreakdown ?? []).map((e: any) => {
                const lvl = e.level === "yes" ? "Fort" : e.level === "medium" ? "Moyen" : "Faible";
                return `• ${cleanText(e.criterion)} (${lvl}) : ${cleanText(e.assessment)}`;
            }),
            s.bestFor ? `Pour toi si : ${cleanText(s.bestFor)}.` : "",
        ].filter(Boolean);

        return { name: cleanText(s.name), analysis: lines.join("\n") };
    });

    return {
        destinationSummaries,
        ranking: data.ranking ?? selectedDestinations.map(getDestinationLabel),
        verdict: cleanText(data.verdict),
        rawCriteria: data.destinationSummaries ?? [],
    };
}

export async function callOllamaFollowup(
    selectedDestinations: Destination[],
    selectedCriteria: string[],
    aiResult: AiResult,
    messages: ChatMessage[],
    question: string
): Promise<string> {
    const res = await fetch("/api/compare/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            destinations: selectedDestinations.map(d => ({
                id: d.id,
                name: getDestinationLabel(d),
                country: d.country,
                location: d.location,
                type: d.type,
                languages: d.languages,
                description: d.description,
            })),
            criteria: selectedCriteria,
            ranking: aiResult.ranking,
            verdict: aiResult.verdict,
            summaries: aiResult.destinationSummaries,
            messages,
            question,
        }),
    });

    if (!res.ok) throw new Error(`Followup API error: ${res.status}`);

    const data = await res.json();
    return cleanText(data.answer);
}