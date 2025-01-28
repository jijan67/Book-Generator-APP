import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Select from 'react-select';
import { CSVLink } from 'react-csv';
import { BookGenerator } from './utils/BookGenerator';
import { Book, RegionOption } from './types/BookTypes';
import { 
  ClipboardCopyIcon, 
  RefreshCwIcon 
} from 'lucide-react';
import './App.css';

const INITIAL_LOAD_COUNT = 20;
const LOAD_MORE_BATCH = 10;

const regionOptions: RegionOption[] = [
  { 
    value: 'en-US', 
    label: 'English (USA)', 
    language: 'en',
    flag: 'https://flagcdn.com/w320/us.png'
  },
  { 
    value: 'de-DE', 
    label: 'German (Germany)', 
    language: 'de',
    flag: 'https://flagcdn.com/w320/de.png'
  },
  { 
    value: 'bn-BD', 
    label: 'Bangla (Bangladesh)', 
    language: 'bn',
    flag: 'https://flagcdn.com/w320/bd.png'
  }
];

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(regionOptions[0]);
  const [seed, setSeed] = useState<string>('');
  const [avgLikes, setAvgLikes] = useState<number>(5);
  const [avgReviews, setAvgReviews] = useState<number>(3);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('gallery');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [seedCopied, setSeedCopied] = useState<boolean>(false);

  const seedInputRef = useRef<HTMLInputElement>(null);

  const generateRandomSeed = useCallback(() => {
    const timestamp = new Date().getTime().toString();
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}`;
  }, []);

  const handleCopySeed = useCallback(() => {
    if (seedInputRef.current) {
      seedInputRef.current.select();
      document.execCommand('copy');
      setSeedCopied(true);
      setTimeout(() => setSeedCopied(false), 2000);
    }
  }, []);

  const generateNewBooks = useCallback(() => {
    setIsLoading(true);
    const currentSeed = generateRandomSeed();
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
  }, [selectedRegion, avgLikes, avgReviews, generateRandomSeed]);

  const loadInitialBooks = useCallback(() => {
    if (books.length === 0) {
      generateNewBooks();
    }
  }, [books, generateNewBooks]);

  useEffect(() => {
    loadInitialBooks();
  }, [selectedRegion, loadInitialBooks]);

  const loadMoreBooks = useCallback(() => {
    setIsLoadingMore(true);
    const bookGenerator = new BookGenerator(
      seed, 
      selectedRegion.value, 
      avgLikes, 
      avgReviews
    );

    const newBooks = bookGenerator.generateBooks(LOAD_MORE_BATCH, books.length);
    setBooks(prevBooks => [...prevBooks, ...newBooks]);
    setIsLoadingMore(false);
  }, [seed, selectedRegion, avgLikes, avgReviews, books.length]);

  const handleExportToCSV = useCallback(() => {
    setIsExporting(true);
    // Simulate a brief export process
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  }, []);

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

  const booksToRender = useMemo(() => {
    // Language-specific filtering
    const languageFilteredBooks = books.filter(book => {
      // Function to check if a name matches the selected language
      const isNameInLanguage = (name: string) => {
        switch (selectedRegion.language) {
          case 'en':
            // English names use Latin characters
            return /^[A-Za-z\s]+$/.test(name);
          case 'de':
            // German names can include umlauts and special characters
            return /^[A-Za-zÄÖÜäöüß\s]+$/.test(name);
          case 'bn':
            // Bangla names use Bengali script
            return /^[আ-ৎ\s]+$/.test(name);
          default:
            return true;
        }
      };

      // Check if at least one author name matches the language
      return book.authors.some(author => isNameInLanguage(author));
    });

    return viewMode === 'gallery' 
      ? languageFilteredBooks 
      : languageFilteredBooks.slice(0, Math.ceil(languageFilteredBooks.length / 3) * 3);
  }, [books, viewMode, selectedRegion]);

  const csvData = useMemo(() => 
    booksToRender.map(book => ({
      Index: book.index,
      ISBN: book.isbn,
      Title: book.title,
      Authors: book.authors.join(', '),
      Publisher: book.publisher,
      Likes: book.details?.likes,
      Reviews: book.details?.reviews.length
    })), 
  [booksToRender]);

  const renderRegionSelect = () => (
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
        formatOptionLabel={({ label, flag }) => (
          <div className="region-option">
            <img 
              src={flag} 
              alt={`${label} flag`} 
              style={{ width: '30px', height: '20px', objectFit: 'cover' }} 
            />
            {label}
          </div>
        )}
      />
    </div>
  );

  const renderSeedInput = () => (
    <div className="control-group">
      <label>Seed</label>
      <div className="seed-input-container">
        <input 
          ref={seedInputRef}
          type="text" 
          value={seed} 
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Enter seed or leave blank for random"
        />
        <button 
          className="seed-copy-btn"
          onClick={handleCopySeed}
          title="Copy Seed"
        >
          <ClipboardCopyIcon size={18} />
        </button>
        <button 
          className="generate-random-seed"
          onClick={() => setSeed(generateRandomSeed())}
          title="Generate Random Seed"
        >
          <RefreshCwIcon size={18} />
        </button>
        {seedCopied && (
          <div className="seed-status visible">
            Seed copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="controls-container">
        {renderRegionSelect()}
        {renderSeedInput()}
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
        <button 
          className="generate-books-button"
          onClick={generateNewBooks}
        >
          Generate New Books
        </button>
        <CSVLink 
          data={csvData}
          filename="generated_books.csv"
          className={`export-button ${isExporting ? 'loading' : ''}`}
          onClick={handleExportToCSV}
        >
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </CSVLink>
      </div>

      <div className={`books-container ${viewMode}-view`}>
        {booksToRender.map((book, index) => renderBookCard(book, index))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {isLoading ? (
          <p>Loading books...</p>
        ) : (
          <button 
            onClick={loadMoreBooks} 
            className={`load-more-button ${isLoadingMore ? 'loading' : ''}`}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More Books'}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
