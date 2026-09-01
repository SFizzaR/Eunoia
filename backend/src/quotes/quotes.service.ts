// quotes.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuotesService {
  async get() {
    try {
      const response = await fetch('https://zenquotes.io/api/today');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      // zenquotes returns an array with one quote object
      if (Array.isArray(data) && data.length > 0) {
        return {
          quote: data[0].q, // Quote text
          author: data[0].a.replace(/,\s*$/, ''), // Remove trailing comma
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Quote fetch error:', error);

      // Return fallback quote
      return {
        quote: 'Every day is a fresh start.',
        author: 'Life Wisdom',
      };
    }
  }
}
