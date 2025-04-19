export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  language: string;
  medium_cover_image: string;
  large_cover_image: string;
  background_image: string;
  description_full: string;
  yt_trailer_code: string;
  torrents: {
    url: string;
    hash: string;
    quality: string;
    size: string;
    type: string;
  }[];
}

export interface MovieResponse {
  status: string;
  status_message: string;
  data: {
    movie_count: number;
    limit: number;
    page_number: number;
    movies: Movie[];
  };
}

export interface MovieDetailsResponse {
  status: string;
  status_message: string;
  data: {
    movie: Movie;
  };
}

export interface MovieSuggestionsResponse {
  status: string;
  status_message: string;
  data: {
    movies: Movie[];
  };
}