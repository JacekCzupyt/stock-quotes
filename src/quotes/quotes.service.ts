import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { QuoteInput } from "./models/quote-input.dto";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { Quote } from "./models/quote-query.dto";

@Injectable()
export class QuotesService {
  private quotes: Quote[] = [
    {
      id: 0,
      instrument: "AAPL",
      timestamp: new Date(1621620906000),
      price: 12600,
    },
    {
      id: 1,
      instrument: "GOOGL",
      timestamp: new Date(1621620906 - 1000 * 3600 * 24),
      price: 229538,
    },
    {
      id: 2,
      instrument: "AAPL",
      timestamp: new Date(1621620906 - 1000 * 3600 * 24),
      price: 12720,
    },
  ];

  getAll(): Quote[] {
    return this.quotes;
  }

  getOne(quoteInput: QuoteInput): Quote {
    const found_quote = this.quotes.find((inst) => inst.id === quoteInput.id);
    if (!found_quote) {
      throw new NotFoundException(`No quote with id "${quoteInput.id}"`);
    }
    return found_quote;
  }

  addNew(quote: QuoteMutation): Quote {
    let new_quote: Quote = { id: this.quotes.length, ...quote };
    return this.quotes[this.quotes.push(new_quote) - 1];
  }
}
