import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select';
import { CSVLink } from 'react-csv';
import { BookGenerator } from './utils/BookGenerator';
import { Book, RegionOption } from './types/BookTypes';
import './App.css';

const INITIAL_LOAD_COUNT = 20;
const LOAD_MORE_BATCH = 10;

const regionOptions: RegionOption[] = [
  { value: 'en-US', label: 'English (USA)', language: 'en' },
  { value: 'de-DE', label: 'German (Germany)', language: 'de' },
  { value: 'bn-BD', label: 'Bangla (Bangladesh)', language: 'bn' }
];

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(regionOptions[0]);
  const [seed, setSeed] = useState<string>('');
  const [avgLikes, setAvgLikes] = useState<number>(5);
  const [avgReviews, setAvgReviews] = useState<number>(3);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('gallery');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateRandomSeed = useCallback(() => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }, []);

  const loadInitialBooks = useCallback(() => {
    setIsLoading(true);
    const currentSeed = seed || generateRandomSeed();
    setSeed(currentSeed);

    const bookGenerator = new BookGenerator(
      currentSeed, 
      selectedRegion.value, 
      avgLikes, 
      avgReviews
    );

    const generatedBooks = bookGenerator.generateBooks(INITIAL_LOAD_COUNT, 0);
    setBooks(generatedBooks);
    setIsLoading(false);
  }, [seed, selectedRegion, avgLikes, avgReviews, generateRandomSeed]);

  const loadMoreBooks = useCallback(() => {
    setIsLoading(true);
    const bookGenerator = new BookGenerator(
      seed, 
      selectedRegion.value, 
      avgLikes, 
      avgReviews
    );

    const newBooks = bookGenerator.generateBooks(LOAD_MORE_BATCH, books.length);
    setBooks(prevBooks => [...prevBooks, ...newBooks]);
    setIsLoading(false);
  }, [seed, selectedRegion, avgLikes, avgReviews, books.length]);

  useEffect(() => {
    loadInitialBooks();
  }, [selectedRegion, loadInitialBooks]);

  const renderBookCard = (book: Book, index: number) => (
    <div 
      key={book.isbn} 
      className="book-card" 
      style={{ '--index': index } as React.CSSProperties}
    >
      <img 
        src={book.details?.coverImage} 
        alt={`Cover for ${book.title}`} 
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://via.placeholder.com/400x600.png?text=Book+Cover';
        }}
      />
      <div className="book-details">
        <h3>{book.title}</h3>
        <p>Authors: {book.authors.join(', ')}</p>
        <p>Publisher: {book.publisher}</p>
        <div className="book-stats">
          <span>ISBN: {book.isbn}</span>
          <span>Likes: {book.details?.likes || 0}</span>
        </div>
        {book.details?.reviews.map((review, idx) => (
          <div key={idx} className="review">
            <p>{review.text}</p>
            <small>- {review.author} (Rating: {review.rating}/5)</small>
          </div>
        ))}
      </div>
    </div>
  );

  const filteredBooksToRender = useMemo(() => {
    const languageFilteredBooks = books.filter(book => 
      book.authors.some(author => 
        author.split(' ').some(namePart => 
          namePart.match(new RegExp(`[${selectedRegion.language === 'en' ? 'A-Za-z' : selectedRegion.language === 'de' ? 'ÄÖÜäöüß' : 'আ-ৎ'}]+`))
        )
      )
    );

    return viewMode === 'gallery' 
      ? languageFilteredBooks 
      : languageFilteredBooks.slice(0, Math.ceil(languageFilteredBooks.length / 3) * 3);
  }, [books, viewMode, selectedRegion]);

  return (
    <div className="app-container">
      <div className="controls-container">
        <div className="control-group">
          <label>Region</label>
          <Select
            value={selectedRegion}
            onChange={(selected) => {
              setSelectedRegion(selected as RegionOption);
              // Reset seed to regenerate books with new locale
              setSeed('');
            }}
            options={regionOptions}
          />
        </div>
        <div className="control-group">
          <label>Seed</label>
          <input 
            type="text" 
            value={seed} 
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter seed or leave blank for random"
          />
          <button onClick={() => setSeed(generateRandomSeed())}>
            Generate Random Seed
          </button>
        </div>
        <div className="control-group">
          <label>Average Likes (0-10)</label>
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="0.5"
            value={avgLikes} 
            onChange={(e) => setAvgLikes(parseFloat(e.target.value))}
          />
          <span>{avgLikes}</span>
        </div>
        <div className="control-group">
          <label>Average Reviews (0-10)</label>
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="0.5"
            value={avgReviews} 
            onChange={(e) => setAvgReviews(parseFloat(e.target.value))}
          />
          <span>{avgReviews}</span>
        </div>
      </div>

      <div className="view-toggle">
        <button 
          className={viewMode === 'gallery' ? 'active' : ''} 
          onClick={() => setViewMode('gallery')}
        >
          Gallery View
        </button>
        <button 
          className={viewMode === 'table' ? 'active' : ''} 
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
        <CSVLink 
          data={books.map(book => ({
            Index: book.index,
            ISBN: book.isbn,
            Title: book.title,
            Authors: book.authors.join(', '),
            Publisher: book.publisher,
            Likes: book.details?.likes,
            Reviews: book.details?.reviews.length
          }))}
          filename="generated_books.csv"
          className="export-button"
        >
          Export to CSV
        </CSVLink>
      </div>

      <div className={`books-container ${viewMode}-view`}>
        {filteredBooksToRender.map((book, index) => renderBookCard(book, index))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {isLoading ? (
          <p>Loading more books...</p>
        ) : (
          filteredBooksToRender.length < books.length && (
            <button onClick={loadMoreBooks} className="export-button">
              Load More Books
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default App;
