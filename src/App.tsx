import React, { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import { BookGenerator } from './utils/BookGenerator';
import { Book, LocaleOption } from './types/BookTypes';
import BookTable from './components/BookTable';
import BookDetailsModal from './components/BookDetailsModal';
import { exportToCsv } from './utils/csvExport';

function App() {
  const [seed, setSeed] = useState(Math.random().toString(36).substring(2, 15));
  const [locale, setLocale] = useState<LocaleOption>('en-US');
  const [avgLikes, setAvgLikes] = useState(5);
  const [avgReviews, setAvgReviews] = useState(3);
  
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const generateMoreBooks = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    const generator = new BookGenerator(seed, locale, avgLikes, avgReviews);
    
    // Get the last index of existing books to continue from
    const lastIndex = books.length > 0 ? books[books.length - 1].index : 0;
    const startPage = Math.floor(lastIndex / 20);
    
    // Generate 20 more books starting from the last index
    const newBooks = generator.generateBooks(startPage, 20, lastIndex);
    
    // Ensure new books are added
    if (newBooks.length > 0) {
      setBooks(prevBooks => {
        // Prevent duplicate books
        const uniqueNewBooks = newBooks.filter(
          newBook => !prevBooks.some(existingBook => existingBook.index === newBook.index)
        );
        return [...prevBooks, ...uniqueNewBooks];
      });
    }
    
    setIsLoading(false);
  }, [seed, locale, avgLikes, avgReviews, books, isLoading]);

  // Initial book generation and reset when configuration changes
  useEffect(() => {
    // Reset books when configuration changes
    setBooks([]);
    
    // Generate initial 20 books
    const generator = new BookGenerator(seed, locale, avgLikes, avgReviews);
    const initialBooks = generator.generateBooks(0, 20);
    setBooks(initialBooks);
  }, [seed, locale, avgLikes, avgReviews]);

  // Infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading) {
          generateMoreBooks();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of loader is visible
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
      observerRef.current = observer;
    }

    return () => {
      if (currentLoader && observerRef.current) {
        observerRef.current.unobserve(currentLoader);
      }
    };
  }, [generateMoreBooks, isLoading]);

  const handleRandomSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 15));
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
  };

  const handleCsvExport = () => {
    exportToCsv(books, `books_${seed}_${locale}.csv`);
  };

  return (
    <div className="App">
      <div className="config-container">
        <div className="locale-select">
          <label>
            Locale:
            <select 
              value={locale} 
              onChange={(e) => {
                // Reset books when locale changes
                setBooks([]);
                setLocale(e.target.value as LocaleOption);
              }}
            >
              <option value="en-US">English (USA)</option>
              <option value="de-DE">German (Germany)</option>
              <option value="bn-BD">Bangla (Bangladesh)</option>
            </select>
          </label>
        </div>
        
        <div className="seed-input">
          <label>
            Seed:
            <div className="seed-input-wrapper">
              <input 
                type="text" 
                value={seed} 
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Enter custom seed"
              />
              <button 
                onClick={handleRandomSeed} 
                className="seed-generate-btn"
                title="Generate Random Seed"
              >
                🎲
              </button>
            </div>
          </label>
        </div>

        <div className="likes-reviews-input">
          <label>
            Avg Likes: {avgLikes.toFixed(1)}
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.1" 
              value={avgLikes} 
              onChange={(e) => setAvgLikes(parseFloat(e.target.value))}
            />
          </label>
          
          <label>
            Avg Reviews: {avgReviews.toFixed(1)}
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.1" 
              value={avgReviews} 
              onChange={(e) => setAvgReviews(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="export-container">
          <button 
            onClick={handleCsvExport}
            className="csv-export-btn"
          >
            Export to CSV
          </button>
        </div>
      </div>

      <BookTable 
        books={books} 
        onBookSelect={handleBookSelect}
      />

      <div ref={loaderRef} className="loader">
        {isLoading ? 'Loading more books...' : 'Scroll to load more books'}
      </div>

      {selectedBook && (
        <BookDetailsModal 
          book={selectedBook} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}

export default App;
