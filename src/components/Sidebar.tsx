import React, { useState, useEffect } from 'react';
import {
  Filter,
  // Genre Icons (IMDb Based)
  LayoutGrid,     // All
  Sword,           // Action
  Compass,         // Adventure
  Brush,           // Animation
  Smile,           // Comedy
  Fingerprint,     // Crime
  Film,            // Documentary
  Theater,         // Drama
  Home,            // Family
  Wand2,           // Fantasy
  Scroll,          // History
  Ghost,           // Horror
  Key,             // Mystery
  Heart,           // Romance
  Rocket,          // Sci-Fi
  Shield,          // War
  Wind,            // Western (representing tumbleweed/open plains)
  Hourglass,       // Thriller
  Clapperboard,    // Default/Fallback
} from 'lucide-react';

// Define an interface for the props
interface SidebarProps {
  selectedGenre: string;
  selectedQuality: string;
  selectedRating: string;
  onGenreSelect: (genre: string) => void;
  onQualitySelect: (quality: string) => void;
  onRatingChange: (rating: string) => void;
}

// Updated list of genres based on IMDb common genres
const genres = [
  'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'War', 'Western',
];

// Map genres to corresponding Lucide icons
const genreIcons: { [key: string]: React.ElementType } = {
  All: LayoutGrid, Action: Sword, Adventure: Compass, Animation: Brush, Comedy: Smile,
  Crime: Fingerprint, Documentary: Film, Drama: Theater, Family: Home, Fantasy: Wand2,
  History: Scroll, Horror: Ghost, Mystery: Key, Romance: Heart, SciFi: Rocket,
  Thriller: Hourglass, War: Shield, Western: Wind, Default: Clapperboard,
};
genreIcons['Sci-Fi'] = Rocket; // Correct key

// List of qualities with display text
const qualities = [
  { value: '720p', displayText: 'HD' },
  { value: '1080p', displayText: 'FullHD' },
  { value: '2160p', displayText: '4K' },
  { value: '3D', displayText: '3D' },
];

// The Sidebar component
export function Sidebar({
  selectedGenre,
  selectedQuality,
  selectedRating,
  onGenreSelect,
  onQualitySelect,
  onRatingChange,
}: SidebarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ratingOptions = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 20) {
        setIsVisible(true);
      } else if (e.clientX > 280 && !isMouseInSidebar(e)) {
        setIsVisible(false);
      }
    };

    const isMouseInSidebar = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        return (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
        );
      }
      return false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      id="sidebar"
      // REMOVED scrollbar classes: scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
      className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-r from-red-600 to-gray-900 pt-24 px-4 transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
  isVisible ? 'translate-x-0' : '-translate-x-full'
}`}
      style={{
        boxShadow: isVisible ? '4px 0 15px rgba(0, 0, 0, 0.5)' : 'none',
      }}
    >
      {/* Filters Header */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <Filter size={22} className="text-red-600 flex-shrink-0" />
        <h2 className="text-xl font-semibold text-white">Filters</h2>
      </div>

      {/* Genres Section */}
      <div className="mb-8">
        <h3 className="text-gray-400 mb-3 text-sm font-medium px-1">Genres</h3>
        <div className="space-y-1.5">
          {genres.map((genre) => {
            const IconComponent = genreIcons[genre] || genreIcons.Default;
            return (
              <button
                key={genre}
                onClick={() => onGenreSelect(genre)}
                className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded transition-all duration-200 text-gray-200 ${
                  selectedGenre === genre
                    ? 'bg-red-600 text-white font-medium shadow-md'
                    : 'hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <IconComponent size={18} className="flex-shrink-0" />
                <span>{genre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality Section */}
      <div className="mb-8 pb-8">
        <h3 className="text-gray-400 mb-3 text-sm font-medium px-1">Quality</h3>
        <div className="space-y-1.5">
          {qualities.map((qualityItem) => (
            <button
              key={qualityItem.value}
              onClick={() => onQualitySelect(qualityItem.value)}
              className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded transition-all duration-200 text-gray-200 ${
                selectedQuality === qualityItem.value
                  ? 'bg-red-600 text-white font-medium shadow-md'
                  : 'hover:bg-gray-800/60 hover:text-white'
              }`}
            >
              <span className="font-bold italic">{qualityItem.displayText}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating Section */}
      <div className="mb-8">
        <h3 className="text-gray-400 mb-3 text-sm font-medium px-1">Minimum Rating</h3>
        <div className="px-1">
          <select
            className="w-full bg-gray-800 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={selectedRating}
            onChange={(e) => {
              onRatingChange(e.target.value);
            }}
          >
            <option value="">Any</option>
            {ratingOptions.slice(1).map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
}
