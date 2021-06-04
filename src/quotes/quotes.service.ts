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
import { InjectRepository } from "@nestjs/typeorm";
import { QuoteEntity } from "./models/quote.entity";
import { Repository } from "typeorm";

@Injectable()
export class QuotesService {
  constructor(
    private readonly instrumentsService: InstrumentsService,
    @InjectRepository(QuoteEntity)
    private quotesRepository: Repository<QuoteEntity>
  ) {}

  //TODO: inject default values?
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

  async getAll(): Promise<Quote[]> {
    return this.quotesRepository.find();
  }

  async getOne(quoteInput: QuoteInput): Promise<Quote> {
    return this.quotesRepository.findOne(quoteInput.id);
    /*if (!found_quote) {
      throw new NotFoundException(`No quote with id "${quoteInput.id}"`);
    }
    return found_quote;*/
  }

  async addNew(quote: QuoteMutation): Promise<Quote> {
    //TODO: reimplement instrument validation
    /*
    //throws error if no instrument with provided ticker is present
    this.instrumentsService.getOne({ instrument_ticker: quote.instrument });
    let new_quote: Quote = { id: this.quotes.length, ...quote };*/

    return this.quotesRepository.save({ ...quote });
  }

  async getByInstrument(input: InstrumentInput): Promise<Quote[]> {
    return this.quotesRepository.find({
      where: { instrument: input.instrument_ticker },
    });
  }
}
