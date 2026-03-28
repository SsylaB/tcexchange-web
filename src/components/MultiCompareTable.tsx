import { Fragment } from "react";
import type { Destination, TableRow } from "../types/compare";
import { computeDestinationScore } from "../utils/criteriaMatch";
import "../styles/Compare/ComparePage.css";

// Cette fonction reste la même, elle fait le lien avec le CSS
function getIndicatorClass(group: string) {
    const map: Record<string, string> = {
        "Type d'échange": "indicator--type",
        Budget: "indicator--budget",
        Géographie: "indicator--geo",
        Langues: "indicator--lang",
        Académique: "indicator--acad",
        "Cadre de vie": "indicator--cadre",
        Expérience: "indicator--exp",
    };
    return map[group] || "indicator--exp";
}

// Fonction utilitaire pour nettoyer les slugs de groupe pour le CSS
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

export default function MultiCompareTable({
    selectedDestinations,
    tableRows,
}: {
    selectedDestinations: Destination[];
    tableRows: TableRow[];
}) {
    if (!tableRows.length) return null;

    const percentages = selectedDestinations.map((_, index) =>
        computeDestinationScore(tableRows, index),
    );

    const grouped: Record<string, TableRow[]> = {};
    for (const row of tableRows) {
        if (!grouped[row.group]) grouped[row.group] = [];
        grouped[row.group].push(row);
    }

    return (
        <div className="compare-results-container">
            {/* 1. Scores globaux (inchangés) */}
            <div className="compare-score-wrap">
                {selectedDestinations.map((dest, index) => (
                    <div key={dest.id} className="compare-score-bar-row">
                        <div className="compare-score-name">{dest.name}</div>
                        <div className="compare-score-track">
                            <div
                                className={`compare-score-fill compare-score-fill--${index === 0 ? "red" : index === 1 ? "blue" : "green"}`}
                                style={{ width: `${percentages[index]}%` }}
                            />
                        </div>
                        <div className="compare-score-pct">
                            {percentages[index]}%
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Tableau comparatif resserré */}
            <div className="compare-table-container">
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th className="compare-table-head">Critère</th>
                            {selectedDestinations.map((dest) => (
                                <th
                                    key={dest.id}
                                    className="compare-table-head"
                                >
                                    {dest.shortName || dest.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(grouped).map(([group, items]) => (
                            <Fragment key={group}>
                                <tr className="compare-group-row">
                                    <td
                                        colSpan={
                                            1 + selectedDestinations.length
                                        }
                                    >
                                        {group}
                                    </td>
                                </tr>
                                {items.map((item) => (
                                    <tr key={item.label}>
                                        {/* MODIFICATION ICI : Nouvelle structure pour le critère */}
                                        <td
                                            className={`compare-table-cell-label compare-table-cell-label--${groupSlug(group)}`}
                                        >
                                            <div className="criterion-row">
                                                <span
                                                    className={`criterion-indicator ${getIndicatorClass(group)}`}
                                                />
                                                <span className="criterion-text">
                                                    {item.label}
                                                </span>
                                            </div>
                                        </td>
                                        {item.cells.map((cell, idx) => (
                                            <td
                                                key={idx}
                                                className={`compare-cell-${cell.level}`}
                                            >
                                                <div className="cell-badge-title">
                                                    {cell.level === "yes"
                                                        ? "✓ Fort"
                                                        : cell.level ===
                                                            "medium"
                                                          ? "~ Moyen"
                                                          : "✗ Faible"}
                                                </div>
                                                {(cell.explanation ||
                                                    cell.text ||
                                                    cell.assessment) && (
                                                    <div className="cell-explanation">
                                                        {cell.explanation ||
                                                            cell.text ||
                                                            cell.assessment}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
