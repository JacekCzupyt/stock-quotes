import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { InstrumentInput } from "../instruments/models/instrument-input.dto";
import { InstrumentsService } from "../instruments/instruments.service";
import { QuoteInput } from "./models/quote-input.dto";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { Quote } from "./models/quote-query.dto";

@Injectable()
export class QuotesService {
  constructor(
    //@Inject(forwardRef(() => InstrumentsService))
    private readonly instrumentsService: InstrumentsService
  ) {}

  public static defaultArrayState = () => [
    {
      id: 0,
      instrument: "AAPL",
      timestamp: new Date(1621620906000),
      price: 12600,
    },
    {
      id: 1,
      instrument: "GOOGL",
      timestamp: new Date(1621620906000 - 1000 * 3600 * 24),
      price: 229538,
    },
    {
      id: 2,
      instrument: "AAPL",
      timestamp: new Date(1621620906000 - 1000 * 3600 * 24),
      price: 12720,
    },
  ];

  private quotes: Quote[] = QuotesService.defaultArrayState();

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
    //throws error if no instrument with provided ticker is present
    this.instrumentsService.getOne({ instrument_ticker: quote.instrument });
    let new_quote: Quote = { id: this.quotes.length, ...quote };
    return this.quotes[this.quotes.push(new_quote) - 1];
  }

  getByInstrument(input: InstrumentInput): Quote[] {
    return this.quotes.filter(
      (quote) => quote.instrument === input.instrument_ticker
    );
  }
}
