import type { AiResult, AiSummary } from "../types/compare";
import type { Destination } from "../types"

export function normalizeExchangeType(exchangeType: string): string {
    const value = exchangeType.toLowerCase();
    if (value.includes("erasmus")) return "Erasmus+";
    if (value.includes("bilat")) return "Accord bilatéral";
    if (value.includes("double")) return "Double diplôme";
    return exchangeType;
}

export function stripMarkdown(text: string) {
    return text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .trim();
}

export function safeParseJson<T>(text: string): T | null {
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

export function getOrderedSummaries(
    aiResult: AiResult,
    selectedDestinations: Destination[],
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
