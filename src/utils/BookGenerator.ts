import { faker as fakerEN } from '@faker-js/faker/locale/en';
import { faker as fakerDE } from '@faker-js/faker/locale/de';
import seedrandom from 'seedrandom';
import { Book, BookDetails } from '../types/BookTypes';

export class BookGenerator {
  private rng: () => number;
  private localeValue: string;
  private avgLikes: number;
  private avgReviews: number;
  private faker: typeof fakerEN;

  constructor(seed: string, locale: string, avgLikes: number, avgReviews: number) {
    const generator = seedrandom(seed);
    this.rng = generator;
    this.localeValue = locale;
    this.avgLikes = avgLikes;
    this.avgReviews = avgReviews;
    
    // Select appropriate faker based on locale
    switch(locale) {
      case 'de-DE':
        this.faker = fakerDE;
        break;
      case 'bn-BD':
        // Custom Bangla-like generation using English faker
        this.faker = {
          ...fakerEN,
          person: {
            ...fakerEN.person,
            fullName: () => {
              const firstNames = [
                'আমির', 'রাহুল', 'সুমন', 'রাজিব', 'নাসির', 
                'মাহমুদ', 'আরিফ', 'সাকিব', 'রাসেল', 'তানভীর'
              ];
              const lastNames = [
                'হোসেন', 'আলী', 'খান', 'রহমান', 'ইসলাম', 
                'মিয়া', 'সরকার', 'চৌধুরী', 'মন্ডল', 'শেখ'
              ];
              return `${firstNames[Math.floor(this.rng() * firstNames.length)]} ${lastNames[Math.floor(this.rng() * lastNames.length)]}`;
            }
          },
          company: {
            ...fakerEN.company,
            name: () => {
              const companyTypes = [
                'বাংলা', 'দেশী', 'আমার', 'সোনার', 'নতুন', 
                'প্রগতি', 'জাতীয়', 'আন্তর্জাতিক'
              ];
              const companyNames = [
                'কোম্পানি', 'ব্যবসা', 'সংস্থা', 'প্রতিষ্ঠান', 
                'গ্রুপ', 'সমিতি'
              ];
              return `${companyTypes[Math.floor(this.rng() * companyTypes.length)]} ${companyNames[Math.floor(this.rng() * companyNames.length)]}`;
            }
          },
          commerce: {
            ...fakerEN.commerce,
            productName: () => {
              const adjectives = [
                'সুন্দর', 'বড়', 'ছোট', 'পুরানো', 'নতুন', 
                'লাল', 'সবুজ', 'নীল', 'সাদা', 'কালো'
              ];
              const nouns = [
                'বই', 'কাগজ', 'কলম', 'কাপড়', 'জিনিস', 
                'মাল', 'সম্পদ', 'উপহার', 'সংগ্রহ'
              ];
              return `${adjectives[Math.floor(this.rng() * adjectives.length)]} ${nouns[Math.floor(this.rng() * nouns.length)]}`;
            }
          },
          lorem: {
            ...fakerEN.lorem,
            paragraph: () => {
              const sentences = [
                'এটি একটি সাধারণ বাংলা অনুচ্ছেদ।', 
                'বাংলাদেশ একটি সুন্দর দেশ।', 
                'আমি বাংলা ভাষা ভালোবাসি।', 
                'শিক্ষা হল জীবনের সবচেয়ে বড় সম্পদ।', 
                'সকলের সাথে সম্প্রীতি ও ভালোবাসা রাখা উচিত।'
              ];
              return sentences[Math.floor(this.rng() * sentences.length)];
            }
          }
        } as typeof fakerEN;
        break;
      default:
        this.faker = fakerEN;
    }
  }

  private generateISBN(): string {
    const prefix = '978';
    const group = Math.floor(this.rng() * 10).toString();
    const publisher = Math.floor(this.rng() * 100000).toString().padStart(5, '0');
    const title = Math.floor(this.rng() * 1000).toString().padStart(3, '0');
    const checkDigit = Math.floor(this.rng() * 10).toString();
    return `${prefix}-${group}-${publisher}-${title}-${checkDigit}`;
  }

  private generateCoverImage(index: number): string {
    const imageTypes = [
      'abstract', 'nature', 'city', 'transport', 'fashion', 
      'people', 'technics', 'animals', 'food', 'business'
    ];
    const imageType = imageTypes[Math.floor(this.rng() * imageTypes.length)];
    
    // Improved image generation with multiple fallback mechanisms
    const imageServices = [
      () => `https://picsum.photos/seed/${index * 10}/400/600`,
      () => `https://placeimg.com/400/600/${imageType}?seed=${index}`,
      () => `https://source.unsplash.com/400x600/?${imageType},book?sig=${index}`,
      () => this.faker.image.urlLoremFlickr({ 
        width: 400, 
        height: 600, 
        category: imageType 
      }),
      // Fallback placeholder image
      () => `https://via.placeholder.com/400x600.png?text=Book+Cover`
    ];

    // Try each image service, return the first successful one
    for (const imageGenerator of imageServices) {
      try {
        const imageUrl = imageGenerator();
        return imageUrl;
      } catch (error) {
        console.warn(`Image generation failed: ${error}`);
        continue;
      }
    }

    // Final fallback if all image services fail
    return `https://via.placeholder.com/400x600.png?text=Book+Cover`;
  }

  private generateReviews(count: number): { text: string; author: string; rating: number }[] {
    const reviews: { text: string; author: string; rating: number }[] = [];
    let actualCount = Math.floor(count);
    const remainder = count - actualCount;

    if (this.rng() < remainder) {
      actualCount += 1;
    }

    for (let i = 0; i < actualCount; i++) {
      reviews.push({
        text: this.faker.lorem.paragraph(),
        author: this.faker.person.fullName(),
        rating: Math.max(1, Math.min(5, Math.round(this.rng() * 5)))
      });
    }

    return reviews;
  }

  private generateBookDetails(index: number): BookDetails {
    // Language-specific like multipliers to create variation
    const likeMultipliers: { [key: string]: number } = {
      'en': 1.2,   // English books slightly more popular
      'de': 1.0,   // German books standard popularity
      'bn': 0.8    // Bangla books slightly less popular
    };

    // Determine the language from the current locale
    const language = this.localeValue.split('-')[0];
    
    // Apply language-specific multiplier to likes
    const languageMultiplier = likeMultipliers[language] || 1;
    
    return {
      coverImage: this.generateCoverImage(index),
      reviews: this.generateReviews(this.avgReviews),
      likes: Math.max(0, Math.round(
        this.rng() * 
        this.avgLikes * 
        20 * 
        languageMultiplier
      ))
    };
  }

  public generateBooks(count: number, startIndex: number): Book[] {
    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i + 1;
      const book: Book = {
        index,
        isbn: this.generateISBN(),
        title: this.faker.commerce.productName(),
        authors: Array(1 + Math.floor(this.rng() * 3))
          .fill(null)
          .map(() => this.faker.person.fullName()),
        publisher: this.faker.company.name(),
        details: this.generateBookDetails(index)
      };
      return book;
    });
  }
}
