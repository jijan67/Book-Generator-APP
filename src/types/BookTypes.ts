export type LocaleOption = 'en-US' | 'de-DE' | 'bn-BD';

export interface BookReview {
  reviewer: string;
  text: string;
  rating: number;
}

export interface BookDetails {
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  coverImage: string;
}

export interface Book extends BookDetails {
  index: number;
  likes: number;
  reviews: BookReview[];
}
