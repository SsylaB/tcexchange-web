import { useState } from "react";
import type { CriteriaGroupMap } from "../types/compare";

function getCriteriaHeaderClass(groupName: string) {
  if (groupName === "Logistique") return "compare-criteria-header--logistique";
  if (groupName === "Académique") return "compare-criteria-header--academique";
  if (groupName === "Cadre de vie") return "compare-criteria-header--cadre";
  return "compare-criteria-header--experience";
}

export default function CriteriaGroup({
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
