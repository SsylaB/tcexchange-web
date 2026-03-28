import { useEffect, useRef, useState } from "react";
import type { Destination } from "../types/compare";

function safeText(value: unknown): string {
    return typeof value === "string" ? value.toLowerCase() : "";
}

function matchesSearch(dest: Destination, search: string) {
    if (!search) return true;
    return (
        safeText(dest.name).includes(search) ||
        safeText(dest.country).includes(search) ||
        safeText(dest.location).includes(search) ||
        safeText(dest.shortName).includes(search) ||
        safeText(dest.type).includes(search)
    );
}

export default function DestinationPicker({
    label,
    value,
    onSelect,
    excludedIds,
    destinationsByCountry,
    favorites,
    accentColor,
}: {
    label: string;
    value: Destination | null;
    onSelect: (dest: Destination) => void;
    excludedIds?: number[];
    destinationsByCountry: [string, Destination[]][];
    favorites: Destination[];
    accentColor: string;
}) {
    const [open, setOpen] = useState(false);
    const [openCountries, setOpenCountries] = useState<Record<string, boolean>>(
        {},
    );
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function toggleCountry(country: string) {
        setOpenCountries((prev) => ({ ...prev, [country]: !prev[country] }));
    }

    const normalizedSearch = search.trim().toLowerCase();

    const filteredFavorites = favorites.filter(
        (dest) =>
            !excludedIds?.includes(dest.id) &&
            matchesSearch(dest, normalizedSearch),
    );

    const filteredCountries = destinationsByCountry
        .map(([country, items]) => {
            const filteredItems = items.filter(
                (dest) =>
                    !excludedIds?.includes(dest.id) &&
                    matchesSearch(dest, normalizedSearch),
            );
            return [country, filteredItems] as [string, Destination[]];
        })
        .filter(([country, items]) => {
            if (!normalizedSearch) return items.length > 0;
            return (
                safeText(country).includes(normalizedSearch) || items.length > 0
            );
        });

    function selectDest(dest: Destination) {
        onSelect(dest);
        setOpen(false);
        setSearch("");
    }

    return (
        <div ref={wrapperRef} className="compare-picker">
            {label ? (
                <label
                    className="compare-selector-label"
                    style={{ color: accentColor }}
                >
                    {label}
                </label>
            ) : null}

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="compare-picker-trigger"
            >
                {value ? value.name : "-- Choisir --"}
            </button>

            {open && (
                <div className="compare-picker-panel">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un pays ou une université..."
                        className="compare-picker-search"
                    />

                    {filteredFavorites.length > 0 && (
                        <div className="compare-picker-section">
                            <div className="compare-picker-section-title">
                                Favoris
                            </div>
                            <div className="compare-picker-sublist">
                                {filteredFavorites.map((dest) => (
                                    <button
                                        key={`fav-${dest.id}`}
                                        type="button"
                                        className="compare-picker-item"
                                        onClick={() => selectDest(dest)}
                                    >
                                        {dest.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredCountries.map(([country, items]) => (
                        <div key={country} className="compare-picker-section">
                            <button
                                type="button"
                                onClick={() => toggleCountry(country)}
                                className="compare-picker-country-button"
                            >
                                <span>{country}</span>
                                <span>
                                    {normalizedSearch
                                        ? "•"
                                        : openCountries[country]
                                          ? "▲"
                                          : "▼"}
                                </span>
                            </button>

                            {(normalizedSearch || openCountries[country]) && (
                                <div className="compare-picker-sublist">
                                    {items.map((dest) => (
                                        <button
                                            key={dest.id}
                                            type="button"
                                            className="compare-picker-item"
                                            onClick={() => selectDest(dest)}
                                        >
                                            <div className="compare-picker-item-title">
                                                {dest.name}
                                            </div>
                                            <div className="compare-picker-item-sub">
                                                {dest.location}, {dest.country}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredFavorites.length === 0 &&
                        filteredCountries.length === 0 && (
                            <div className="compare-picker-empty">
                                Aucun résultat.
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
