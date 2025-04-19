import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  page: number;
  searchTerm: string;
  selectedGenre: string;
  selectedQuality: string;
  minRating: number;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const initialState = {
  page: 1,
  searchTerm: '',
  selectedGenre: 'All',
  selectedQuality: '',
  minRating: 0,
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initialState,
      setFilters: (filters) => set((state) => ({ ...state, ...filters })),
      resetFilters: () => set(initialState),
    }),
    {
      name: 'movie-filters',
    }
  )
);