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
import { Quote } from "./models/quote.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, Not, Repository } from "typeorm";

@Injectable()
export class QuotesService {
  constructor(
    private readonly instrumentsService: InstrumentsService,
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>
  ) {}

  //private quotes: Quote[] = QuotesService.defaultArrayState();

  async getAll(): Promise<Quote[]> {
    return this.quotesRepository.find();
  }

  async getOne(quoteInput: QuoteInput): Promise<Quote> {
    try {
      return await this.quotesRepository.findOneOrFail(quoteInput.id);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(`No quote with id "${quoteInput.id}"`);
      } else {
        throw e;
      }
    }
  }

  async addNew(quote: QuoteMutation): Promise<Quote> {
    //throws error if no instrument with provided ticker is present
    return this.instrumentsService
      .getOne({
        instrument_ticker: quote.instrument,
      })
      .then((inst) =>
        this.quotesRepository.save({ ...quote, instrument: inst })
      );
  }
}
