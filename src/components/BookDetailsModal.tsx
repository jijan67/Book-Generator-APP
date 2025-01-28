import React from 'react';
import { Book } from '../types/BookTypes';
import './BookDetailsModal.css';

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, onClose }) => {
  return (
    <div className="book-details-modal-overlay" onClick={onClose}>
      <div 
        className="book-details-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="book-details-content">
          <div className="book-cover-section">
            <img 
              src={book.coverImage} 
              alt={`Cover of ${book.title}`} 
              className="book-cover-image" 
            />
            <div className="book-cover-overlay">
              <h2 className="book-modal-title">{book.title}</h2>
              <p className="book-modal-authors">{book.authors.join(', ')}</p>
            </div>
          </div>
          <div className="book-info-section">
            <h3 className="book-details-heading">Book Details</h3>
            <div className="book-details-grid">
              <div className="book-detail-item">
                <span className="book-detail-label">ISBN</span>
                <span className="book-detail-value">{book.isbn}</span>
              </div>
              <div className="book-detail-item">
                <span className="book-detail-label">Publisher</span>
                <span className="book-detail-value">{book.publisher}</span>
              </div>
              <div className="book-detail-item">
                <span className="book-detail-label">Likes</span>
                <span className="book-detail-value">{book.likes}</span>
              </div>
              <div className="book-detail-item">
                <span className="book-detail-label">Reviews</span>
                <span className="book-detail-value">{book.reviews.length}</span>
              </div>
            </div>
            
            <h3 className="book-reviews-heading">Reviews ({book.reviews.length})</h3>
            <div className="book-reviews-container">
              {book.reviews.map((review, index) => (
                <div key={index} className="book-review">
                  <p className="review-text">{review.text}</p>
                  <div className="review-meta">
                    <span className="review-author">{review.reviewer}</span>
                    <span className="review-rating">
                      {Array.from({ length: Math.round(review.rating * 5) }, (_, i) => '★').join('')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
