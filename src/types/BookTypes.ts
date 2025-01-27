export interface RegionOption {
  value: string;
  label: string;
  language: string;
}

export interface BookReview {
  text: string;
  author: string;
  rating: number;
}

export interface BookDetails {
  coverImage: string;
  reviews: BookReview[];
  likes: number;
}

export interface Book {
  index: number;
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  details?: BookDetails;
}
