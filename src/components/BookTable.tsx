import React, { useState } from 'react';
import { Book } from '../types/BookTypes';
import './BookTable.css';

interface BookTableProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

const BookTable: React.FC<BookTableProps> = ({ books, onBookSelect }) => {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleBookSelect = (book: Book) => {
    onBookSelect(book);
    setSelectedBook(book);
  };

  const toggleView = () => {
    setView(prevView => prevView === 'grid' ? 'table' : 'grid');
  };

  return (
    <div className="book-table-container">
      <div className="view-toggle">
        <button 
          onClick={toggleView} 
          className={`view-btn ${view === 'grid' ? 'active' : ''}`}
          title="Grid View"
        >
          <i className="grid-icon">▦</i>
        </button>
        <button 
          onClick={toggleView} 
          className={`view-btn ${view === 'table' ? 'active' : ''}`}
          title="Table View"
        >
          <i className="table-icon">☰</i>
        </button>
      </div>

      {view === 'grid' ? (
        <div className="book-grid">
          {books.map((book) => (
            <div key={book.index} className="book-card" onClick={() => handleBookSelect(book)}>
              <div className="book-card-content">
                <div className="book-cover">
                  <img 
                    src={book.coverImage} 
                    alt={`Cover of ${book.title}`} 
                    className="book-cover-image" 
                  />
                </div>
                <div className="book-details">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-authors">{book.authors.join(', ')}</p>
                  <div className="book-meta">
                    <span className="book-index">#{book.index}</span>
                    <span className="book-likes">
                      <i className="heart-icon">❤️</i> {book.likes} Likes
                    </span>
                    <span className="book-reviews">
                      <i className="review-icon">💬</i> {book.reviews.length} Reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="book-table">
          <thead>
            <tr>
              <th>Index</th>
              <th>ISBN</th>
              <th>Title</th>
              <th>Authors</th>
              <th>Publisher</th>
              <th>Likes</th>
              <th>Reviews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.index}>
                <td>{book.index}</td>
                <td>{book.isbn}</td>
                <td>{book.title}</td>
                <td>{book.authors.join(', ')}</td>
                <td>{book.publisher}</td>
                <td>{book.likes}</td>
                <td>{book.reviews.length}</td>
                <td>
                  <button onClick={() => handleBookSelect(book)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookTable;
