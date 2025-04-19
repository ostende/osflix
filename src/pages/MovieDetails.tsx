import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, Calendar, Film, Download, ArrowLeft } from 'lucide-react';
import type { MovieDetailsResponse, MovieSuggestionsResponse } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';

export const DEFAULT_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://exodus.desync.com:6969/announce',
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz'
];

export function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTorrent, setSelectedTorrent] = useState<string | null>(null);

  const { data: movieData, isLoading } = useQuery<MovieDetailsResponse>({
    queryKey: ['movie', id],
    queryFn: async () => {
      const response = await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}&with_images=true&with_cast=true`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  });

  const { data: suggestionsData } = useQuery<MovieSuggestionsResponse>({
    queryKey: ['suggestions', id],
    queryFn: async () => {
      const response = await fetch(`https://yts.mx/api/v2/movie_suggestions.json?movie_id=${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    enabled: !!movieData
  });

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const movie = movieData?.data.movie;
  if (!movie) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {selectedTorrent && (
        <VideoPlayer
          torrentUrl={selectedTorrent}
          onClose={() => setSelectedTorrent(null)}
        />
      )}
      
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-white hover:text-red-500 transition-colors"
      >
        <ArrowLeft size={24} />
        Back
      </button>

      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.background_image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <div className="flex items-center gap-6 text-gray-300">
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-2" size={20} />
              <span>{movie.rating}/10</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2" size={20} />
              <span>{movie.runtime} min</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2" size={20} />
              <span>{movie.year}</span>
            </div>
            <div className="flex items-center">
              <Film className="mr-2" size={20} />
              <span>{movie.language.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-12">
          <div className="col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed mb-8">{movie.description_full}</p>

            <h2 className="text-2xl font-semibold mb-4">Watch Movie</h2>
            <div className="grid grid-cols-2 gap-4">
              {movie.torrents.map((torrent, index) => (
                <button
                  key={index}
                  onClick={() => {
  const magnetURI = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title)}&${DEFAULT_TRACKERS.map(tr => `tr=${encodeURIComponent(tr)}`).join('&')}`;
  setSelectedTorrent(magnetURI);
}}

                  className="flex items-center justify-between bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <Download className="mr-3" size={20} />
                    <div>
                      <div className="font-medium">{torrent.quality}</div>
                      <div className="text-sm text-gray-400">{torrent.size}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <img
              src={movie.large_cover_image}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>

        {suggestionsData?.data.movies && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">Similar Movies</h2>
            <div className="grid grid-cols-4 gap-6">
              {suggestionsData.data.movies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="relative group cursor-pointer"
                >
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}