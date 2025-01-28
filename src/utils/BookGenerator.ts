import { faker as fakerEN } from '@faker-js/faker/locale/en';
import { faker as fakerDE } from '@faker-js/faker/locale/de';
import seedrandom from 'seedrandom';
import { Book, BookDetails } from '../types/BookTypes';

export class BookGenerator {
  private localeValue: string;
  private avgLikes: number;
  private avgReviews: number;
  private faker: typeof fakerEN;
  private seed: string;

  constructor(seed: string, locale: string, avgLikes: number, avgReviews: number) {
    this.seed = seed;
    this.localeValue = locale;
    this.avgLikes = avgLikes;
    this.avgReviews = avgReviews;
    
    // Select appropriate faker based on locale
    switch(locale) {
      case 'de-DE':
        this.faker = fakerDE;
        break;
      case 'bn-BD':
        this.faker = this.createBanglaFaker();
        break;
      default:
        this.faker = fakerEN;
    }
  }

  // Combine seed with page number for consistent generation
  private combineSeedWithPage(pageNumber: number): string {
    // Simple combination method: concatenate seed and page number
    return `${this.seed}-page-${pageNumber}`;
  }

  private createBanglaFaker(): typeof fakerEN {
    // Extensive Bangla-like name and text generation
    const banglaFirstNames = [
      'আমির', 'রাহুল', 'সুমন', 'রাজিব', 'নাসির', 
      'মাহমুদ', 'আরিফ', 'সাকিব', 'রাসেল', 'তানভীর',
      'আব্দুল', 'জাহিদ', 'রিয়াদ', 'মুশফিক', 'তৌহিদ'
    ];
    const banglaLastNames = [
      'হোসেন', 'আলী', 'খান', 'রহমান', 'ইসলাম', 
      'মিয়া', 'সরকার', 'চৌধুরী', 'মন্ডল', 'শেখ',
      'মাহমুদ', 'কাদের', 'মুন্সী', 'পাল', 'দাস'
    ];
    const banglaTitles = [
      'সোনার বাংলা', 'লাল মাটি', 'নীল আকাশ', 'সবুজ বন', 
      'কালো রাত', 'সাদা দিন', 'লাল ফুল', 'নীল নদী',
      'সবুজ পাহাড়', 'কালো পাখি'
    ];
    const banglaPublishers = [
      'বাংলা প্রকাশনী', 'সাহিত্য সংসদ', 'নতুন দিগন্ত', 
      'আমার বই', 'জাতীয় গ্রন্থ কেন্দ্র', 'বাংলা ভাষা প্রকাশ'
    ];

    return {
      ...fakerEN,
      person: {
        ...fakerEN.person,
        fullName: () => {
          const firstName = banglaFirstNames[Math.floor(Math.random() * banglaFirstNames.length)];
          const lastName = banglaLastNames[Math.floor(Math.random() * banglaLastNames.length)];
          return `${firstName} ${lastName}`;
        }
      },
      company: {
        ...fakerEN.company,
        name: () => banglaPublishers[Math.floor(Math.random() * banglaPublishers.length)]
      },
      commerce: {
        ...fakerEN.commerce,
        productName: () => banglaTitles[Math.floor(Math.random() * banglaTitles.length)]
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
          return sentences[Math.floor(Math.random() * sentences.length)];
        }
      }
    } as typeof fakerEN;
  }

  private generateISBN(): string {
    const prefix = '978';
    const group = Math.floor(Math.random() * 10).toString();
    const publisher = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const title = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const checkDigit = Math.floor(Math.random() * 10).toString();
    return `${prefix}-${group}-${publisher}-${title}-${checkDigit}`;
  }

  private generateCoverImage(index: number): string {
    const imageTypes = [
      'abstract', 'nature', 'city', 'transport', 'fashion', 
      'people', 'technics', 'animals', 'food', 'business'
    ];
    const imageType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
    
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

  private generateReviews(
    count: number, 
    generator: () => number
  ): { text: string; author: string; rating: number }[] {
    const reviews: { text: string; author: string; rating: number }[] = [];
    let actualCount = Math.floor(count);
    const remainder = count - actualCount;

    if (generator() < remainder) {
      actualCount += 1;
    }

    for (let i = 0; i < actualCount; i++) {
      reviews.push({
        text: this.faker.lorem.paragraph(),
        author: this.faker.person.fullName(),
        rating: Math.max(1, Math.min(5, Math.round(generator() * 5)))
      });
    }

    return reviews;
  }

  private generateBookDetails(index: number, generator: () => number): BookDetails {
    // Language-specific like multipliers to create variation
    const likeMultipliers: { [key: string]: number } = {
      'en': 1.2,   // English books slightly more popular
      'de': 1.0,   // German books standard popularity
      'bn': 0.8    // Bangla books slightly less popular
    };
    const languageMultiplier = likeMultipliers[this.localeValue.slice(0, 2)] || 1;
    
    return {
      coverImage: this.generateCoverImage(index),
      reviews: this.generateReviews(this.avgReviews, generator),
      likes: Math.max(0, Math.round(
        generator() * 
        this.avgLikes * 
        20 * 
        languageMultiplier
      ))
    };
  }

  public generateBooks(count: number, startIndex: number): Book[] {
    // Use combined seed for consistent generation across pages
    const combinedSeed = this.combineSeedWithPage(Math.floor(startIndex / count) + 1);
    const generator = seedrandom(combinedSeed);

    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i + 1;
      const book: Book = {
        index,
        isbn: this.generateISBN(),
        title: this.faker.commerce.productName(),
        authors: Array(1 + Math.floor(generator() * 3))
          .fill(null)
          .map(() => this.faker.person.fullName()),
        publisher: this.faker.company.name(),
        details: this.generateBookDetails(index, generator)
      };
      return book;
    });
  }
}
