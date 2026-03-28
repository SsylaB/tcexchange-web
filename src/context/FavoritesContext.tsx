import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type FavoritesContextType = {
    favorites: number[];
    toggleFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    toggleFavorite: () => {},
    isFavorite: () => false,
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<number[]>(() => {
        try {
            const stored = localStorage.getItem("tcexchange_favorites");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    function toggleFavorite(id: number) {
        setFavorites((prev) => {
            const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
            localStorage.setItem("tcexchange_favorites", JSON.stringify(next));
            return next;
        });
    }

    function isFavorite(id: number): boolean {
        return favorites.includes(id);
    }

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    return useContext(FavoritesContext);
}