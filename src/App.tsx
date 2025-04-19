import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Star } from 'lucide-react';
import type { MovieResponse } from './types';
import { Sidebar } from './components/Sidebar';
import { MovieDetails } from './pages/MovieDetails';
import { useFilterStore } from './hooks/useFilterStore';

function MovieList() {
  const {
    page,
    searchTerm,
    selectedGenre,
    selectedQuality,
    minRating,
    setFilters
  } = useFilterStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', page, searchTerm, selectedGenre, selectedQuality, minRating],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        query_term: searchTerm,
        minimum_rating: minRating.toString(),
        ...(selectedGenre !== 'All' && { genre: selectedGenre }),
        ...(selectedQuality && { quality: selectedQuality }),
      });
      const response = await fetch(`https://yts.mx/api/v2/list_movies.json?${params}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  });

  if (error) return <div className="text-red-500">Error loading movies</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed w-full bg-black bg-opacity-90 z-40 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-red-600 text-3xl font-bold">Ostende-Flix</Link>
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setFilters({ searchTerm: e.target.value })}
                className="bg-gray-800 text-white px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </header>

      <Sidebar
        selectedGenre={selectedGenre}
        onGenreSelect={(genre) => setFilters({ selectedGenre: genre })}
        onQualitySelect={(quality) => setFilters({ selectedQuality: quality })}
        onRatingChange={(rating) => setFilters({ minRating: rating })}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data?.data.movies.map((movie) => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="relative group">
                  <img
                    src={movie.medium_cover_image}
                    alt={movie.title}
                    className="w-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                    <div className="absolute bottom-0 p-4">
                      <h3 className="text-lg font-semibold">{movie.title}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="text-yellow-400" size={16} />
                        <span className="ml-1">{movie.rating}/10</span>
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        {movie.year} • {movie.runtime}min
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 pb-8 gap-4">
              <button
                onClick={() => setFilters({ page: Math.max(1, page - 1) })}
                disabled={page === 1}
                className="px-4 py-2 bg-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ page: page + 1 })}
                className="px-4 py-2 bg-red-600 rounded-lg"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MovieList />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
}

export default App;