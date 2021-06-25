import { Injectable, NotFoundException } from "@nestjs/common";
import { InstrumentsService } from "../instruments/instruments.service";
import { QuoteInput } from "./models/quote-input.dto";
import { Quote } from "./models/quote.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, Repository } from "typeorm";

@Injectable()
export class QuotesService {
  constructor(
    private readonly instrumentsService: InstrumentsService,
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>
  ) {}

  //private quotes: Quote[] = QuotesService.defaultArrayState();

  async getAll(num?: number, offset?: number): Promise<Quote[]> {
    //DefalutPageSize can be swapped for some default value if we want pagiantion by default
    const DefalutPageSize = undefined;

    return this.quotesRepository.find({
      take: num ?? DefalutPageSize,
      skip: offset ?? 0
    });
  }

  async getOne(quoteId: number): Promise<Quote> {
    try {
      return await this.quotesRepository.findOneOrFail(quoteId);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(`No quote with id "${quoteId}"`);
      } else {
        throw e;
      }
    }
  }

  async addNew(quote: QuoteInput): Promise<Quote> {
    //throws error if no instrument with provided ticker is present
    let inst = await this.instrumentsService.getOne(quote.instrument);
    return await this.quotesRepository.save(
      this.quotesRepository.create({ ...quote, instrument: inst })
    );
  }
}
