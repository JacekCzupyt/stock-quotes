import { Injectable, NotImplementedException } from "@nestjs/common";
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
      id: 3,
      instrument: "AAPL",
      timestamp: new Date(1621620906 - 1000 * 3600 * 24),
      price: 12720,
    },
  ];

  getall(): Quote[] {
    throw new NotImplementedException();
  }

  getOne(quoteInput: QuoteInput): Quote {
    throw new NotImplementedException();
  }

  addNew(quote: QuoteMutation): Quote {
    throw new NotImplementedException();
  }
}
