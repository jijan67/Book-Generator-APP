import seedrandom from 'seedrandom';
import { faker as fakerEN } from '@faker-js/faker/locale/en_US';
import { faker as fakerDE } from '@faker-js/faker/locale/de';
import { Book, BookDetails, BookReview, LocaleOption } from '../types/BookTypes';

export class BookGenerator {
  private rng: () => number;
  private faker: any;

  constructor(
    private seed: string, 
    private locale: LocaleOption, 
    private avgLikes: number, 
    private avgReviews: number
  ) {
    // Combine seed with locale to ensure stability across different parameters
    const combinedSeed = `${seed}-${locale}`;
    this.rng = seedrandom(combinedSeed);

    switch(locale) {
      case 'de-DE':
        this.faker = fakerDE;
        break;
      case 'bn-BD':
        this.faker = fakerEN; // Fallback to English faker
        break;
      default:
        this.faker = fakerEN;
    }
  }

  private seededRandom(min: number, max: number, additionalSeed: string = ''): number {
    const rng = seedrandom(`${this.seed}-${additionalSeed}-${this.avgLikes}-${this.avgReviews}`);
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  private generateStableSeed(prefix: string, globalIndex: number): string {
    // Create a stable seed that doesn't change with avgLikes or avgReviews
    return `${this.seed}-${this.locale}-${prefix}-${globalIndex}`;
  }

  private generateCoverImage(globalIndex: number, pageNumber: number): string {
    const categories = [
      'abstract', 'nature', 'book', 'art', 'architecture', 
      'fashion', 'technology', 'business', 'food', 'travel',
      'city', 'people', 'animals', 'sports', 'music'
    ];

    // Create a unique seed for each book by combining multiple factors
    const imageSeed = `${this.seed}-unique-cover-${globalIndex}-${pageNumber}-${this.locale}-${this.avgLikes}-${this.avgReviews}`;
    
    // Use a seeded random to select a category
    const rng = seedrandom(imageSeed);
    const categoryIndex = Math.floor(rng() * categories.length);
    const selectedCategory = categories[categoryIndex];

    // Generate a unique image URL with multiple randomization factors
    const uniqueImageUrl = `https://picsum.photos/seed/${imageSeed}/300/450?${selectedCategory}`;

    return uniqueImageUrl;
  }

  private generateBanglaTitle(globalIndex: number, wordCount: number): string {
    const banglaTitleWords = [
      'জীবন', 'প্রেম', 'সংগ্রাম', 'কাহিনী', 'আশা', 'সত্য', 'মুক্তি', 
      'দুঃখ', 'আনন্দ', 'যাত্রা', 'সমাজ', 'মানুষ', 'বাংলা', 'কবিতা', 
      'গল্প', 'উপন্যাস', 'ভালোবাসা', 'স্বাধীনতা', 'সংস্কৃতি', 'ইতিহাস'
    ];

    return Array.from({ length: wordCount }, (_, idx) => 
      banglaTitleWords[this.seededRandom(0, banglaTitleWords.length - 1, `title-word-${globalIndex}-${idx}`)]
    ).join(' ');
  }

  private generateBanglaAuthor(globalIndex: number): string {
    const banglaSurnames = [
      'আহমেদ', 'হাসান', 'রহমান', 'ইসলাম', 'খান', 'মাহমুদ', 'আলী', 'সরকার', 
      'মিয়া', 'শেখ', 'কাজী', 'মল্লিক', 'পাল', 'দাস', 'চৌধুরী', 'বিশ্বাস', 
      'গাজী', 'নাছির', 'সিকদার', 'তালুকদার', 'রাজা', 'বেগম', 'মন্ডল', 
      'হাকিম', 'আক্তার', 'নিয়াজী', 'কুন্ডু', 'রায়', 'মুর্শিদ', 'সাহা'
    ];

    const banglaFirstNames = [
      'রাহিম', 'কামাল', 'আমিন', 'সাদিক', 'জাহিদ', 'নাসির', 'তৌহিদ', 
      'আকবর', 'মাসুদ', 'সাইফুল', 'রবি', 'সুমন', 'আরিফ', 'মাহিন', 
      'সাকিব', 'রাজিব', 'আসিফ', 'রাফি', 'মিলন', 'সাগর', 'রাকিব', 
      'নাঈম', 'ফারহাদ', 'জাকির', 'রাশেদ', 'তানভীর', 'শাকিল', 'রিয়াদ', 
      'আমির', 'সাবিত'
    ];

    // Use a stable seed that doesn't change with avgLikes or avgReviews
    const rng = seedrandom(this.generateStableSeed('author', globalIndex));
    
    // Randomly select first name and surname
    const firstNameIndex = Math.floor(rng() * banglaFirstNames.length);
    const lastNameIndex = Math.floor(rng() * banglaSurnames.length);

    return `${banglaSurnames[lastNameIndex]} ${banglaFirstNames[firstNameIndex]}`;
  }

  private generateBanglaPublisher(globalIndex: number): string {
    const banglaSurnames = [
      'আহমেদ', 'হাসান', 'রহমান', 'ইসলাম', 'খান', 'মাহমুদ', 'আলী', 'সরকার', 
      'মিয়া', 'শেখ', 'কাজী', 'মল্লিক', 'পাল', 'দাস', 'চৌধুরী', 'বিশ্বাস', 
      'গাজী', 'নাছির', 'সিকদার', 'তালুকদার', 'রাজা', 'বেগম', 'মন্ডল', 
      'হাকিম', 'আক্তার', 'নিয়াজী', 'কুন্ডু', 'রায়', 'মুর্শিদ', 'সাহা'
    ];

    const publisherTypes = [
      'প্রকাশনী', 'বুক হাউস', 'লাইব্রেরি', 'সাহিত্য সংসদ', 
      'গ্রন্থ প্রকাশ', 'সাহিত্য কেন্দ্র', 'বই বাজার', 'লেখক সংঘ'
    ];

    // Use a stable seed that doesn't change with avgLikes or avgReviews
    const rng = seedrandom(this.generateStableSeed('publisher', globalIndex));
    
    // Randomly select surname and publisher type
    const surnameIndex = Math.floor(rng() * banglaSurnames.length);
    const publisherTypeIndex = Math.floor(rng() * publisherTypes.length);

    return `${banglaSurnames[surnameIndex]} ${publisherTypes[publisherTypeIndex]}`;
  }

  private generateBookDetails(globalIndex: number, pageNumber: number): BookDetails {
    // Add an extra layer of randomness to ensure different books across pages
    const pageSeed = `-page-${pageNumber}`;
    
    const titleWordCount = this.seededRandom(2, 6, `title-count-${globalIndex}${pageSeed}`);
    
    let title: string;
    let authors: string[];
    let publisher: string;

    switch(this.locale) {
      case 'de-DE':
        title = this.faker.lorem.words(titleWordCount);
        authors = Array.from({ length: this.seededRandom(1, 3, `author-count-${globalIndex}${pageSeed}`) }, () => 
          this.faker.person.fullName()
        );
        publisher = this.faker.company.name();
        break;
      case 'bn-BD':
        title = this.generateBanglaTitle(globalIndex, titleWordCount);
        authors = Array.from({ length: this.seededRandom(1, 3, `author-count-${globalIndex}${pageSeed}`) }, (_, idx) => 
          this.generateBanglaAuthor(globalIndex + idx)
        );
        publisher = this.generateBanglaPublisher(globalIndex);
        break;
      default: // 'en-US'
        title = this.faker.lorem.words(titleWordCount);
        authors = Array.from({ length: this.seededRandom(1, 3, `author-count-${globalIndex}${pageSeed}`) }, () => 
          this.faker.person.fullName()
        );
        publisher = this.faker.company.name();
    }

    return {
      isbn: this.generateISBN(globalIndex),
      title,
      authors,
      publisher,
      coverImage: this.generateCoverImage(globalIndex, pageNumber)
    };
  }

  private generateISBN(index: number): string {
    const prefix = this.seededRandom(100, 999, `isbn-prefix-${index}`);
    const body = this.seededRandom(10000, 99999, `isbn-body-${index}`);
    const check = this.seededRandom(0, 9, `isbn-check-${index}`);
    return `${prefix}-${body}-${check}`;
  }

  private generateReviews(globalIndex: number, pageNumber: number): BookReview[] {
    const pageSeed = `-page-${pageNumber}`;
    
    let reviewTexts: string[];
    switch(this.locale) {
      case 'de-DE':
        reviewTexts = [
          'Ein wunderbares Buch', 
          'Sehr inspirierend', 
          'Hochinteressant', 
          'Absolut fesselnd', 
          'Eine großartige Lektüre'
        ];
        break;
      case 'bn-BD':
        reviewTexts = [
          'অসাধারণ বই', 
          'খুবই মজার', 
          'গভীর অনুভূতি', 
          'অনেক ভাল লাগলো', 
          'চমৎকার লেখা'
        ];
        break;
      default: // 'en-US'
        reviewTexts = [
          'An amazing book', 
          'Highly inspiring', 
          'Absolutely captivating', 
          'A must-read', 
          'Incredibly engaging'
        ];
    }

    const reviewCount = this.probabilisticCount(this.avgReviews);
    return Array.from({ length: reviewCount }, (_, reviewIndex) => ({
      reviewer: this.generateReviewerName(),
      text: reviewTexts[this.seededRandom(0, reviewTexts.length - 1, `review-text-${globalIndex}-${reviewIndex}${pageSeed}`)],
      rating: this.seededRandom(1, 5, `rating-${globalIndex}-${reviewIndex}${pageSeed}`) / 5
    }));
  }

  private generateReviewerName(): string {
    switch(this.locale) {
      case 'de-DE':
        return this.faker.person.fullName();
      case 'bn-BD':
        return this.generateBanglaAuthor(0);
      default: // 'en-US'
        return this.faker.person.fullName();
    }
  }

  private probabilisticCount(avgCount: number): number {
    const randomValue = this.seededRandom(0, 100, 'prob-count') / 100;
    return randomValue < avgCount % 1 ? Math.ceil(avgCount) : Math.floor(avgCount);
  }

  generateBooks(pageNumber: number, batchSize: number = 20, startIndex: number = 0): Book[] {
    return Array.from({ length: batchSize }, (_, index) => {
      // Calculate global index to continue from previous books
      const globalIndex = startIndex + index;
      const details = this.generateBookDetails(globalIndex, pageNumber);
      const likes = this.probabilisticCount(this.avgLikes);
      const reviews = this.generateReviews(globalIndex, pageNumber);

      return {
        index: globalIndex + 1, // Continuous index 
        ...details,
        likes,
        reviews
      };
    });
  }
}
