import { createContext, useContext, useState, useCallback } from "react";

interface FavoritesContextType {
    favorites: number[];
    toggleFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

function loadFavorites(): number[] {
    try {
        const stored = localStorage.getItem("tcexchange_favorites");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<number[]>(loadFavorites);

    const toggleFavorite = useCallback((id: number) => {
        setFavorites(prev => {
            const updated = prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id];
            localStorage.setItem("tcexchange_favorites", JSON.stringify(updated));
            return updated;
        });
    }, []);

    const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
    return ctx;
}
