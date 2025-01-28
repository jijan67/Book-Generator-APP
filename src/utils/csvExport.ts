import { Book } from '../types/BookTypes';

interface ExtendedNavigator extends Navigator {
  msSaveBlob?: (blob: Blob, filename: string) => boolean;
}

export function exportToCsv(books: Book[], filename: string = 'books.csv') {
  // Prepare CSV headers with UTF-8 BOM for proper Unicode support
  const headers = [
    'Index', 
    'ISBN', 
    'Title', 
    'Authors', 
    'Publisher', 
    'Likes', 
    'Review Count', 
    'Average Review Rating'
  ];

  // Transform book data into CSV rows with proper escaping
  const rows = books.map(book => [
    book.index,
    book.isbn,
    // Escape double quotes and handle special characters
    `"${book.title.replace(/"/g, '""')}"`,
    // Join authors with semicolon and escape
    `"${book.authors.map(author => author.replace(/"/g, '""')).join(';')}"`,
    // Escape publisher name
    `"${book.publisher.replace(/"/g, '""')}"`,
    book.likes,
    book.reviews.length,
    book.reviews.length > 0 
      ? (book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length).toFixed(2) 
      : '0'
  ]);

  // Create CSV content with UTF-8 BOM to ensure proper Unicode rendering
  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  const link = document.createElement('a');
  
  const extendedNavigator = navigator as ExtendedNavigator;
  
  if (extendedNavigator.msSaveBlob) {
    // For IE 10+
    extendedNavigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
