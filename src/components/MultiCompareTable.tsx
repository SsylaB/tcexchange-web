import type { ReactNode } from "react";
import type { Destination, TableRow } from "../types/compare";

function getGroupRowClass(group: string) {
  if (group === "Type d'échange") return "compare-group-row--type";
  if (group === "Budget")         return "compare-group-row--budget";
  if (group === "Géographie")     return "compare-group-row--geo";
  if (group === "Langues")        return "compare-group-row--lang";
  if (group === "Académique")     return "compare-group-row--acad";
  if (group === "Cadre de vie")   return "compare-group-row--cadre";
  return "compare-group-row--exp";
}

function colorClass(prefix: string, index: number) {
  return `${prefix}${index === 0 ? "--red" : index === 1 ? "--blue" : "--green"}`;
}

export default function MultiCompareTable({
  selectedDestinations,
  tableRows,
}: {
  selectedDestinations: Destination[];
  tableRows: TableRow[];
}) {
  if (!tableRows.length) return null;

  const totals = selectedDestinations.map(() => 0);
  for (const row of tableRows) {
    row.matches.forEach((match, i) => {
      if (match) totals[i] += 1;
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
                className={`compare-score-fill ${colorClass("compare-score-fill", index)}`}
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
                  className={`compare-table-head ${colorClass("compare-table-head", index)}`}
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
