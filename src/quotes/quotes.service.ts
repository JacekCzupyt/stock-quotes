import { Injectable, NotFoundException } from "@nestjs/common";
import { InstrumentsService } from "../instruments/instruments.service";
import { QuoteInput } from "./models/quote-input.dto";
import { Quote } from "./models/quote.entity";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Connection,
  DeepPartial,
  EntityManager,
  EntityNotFoundError,
  getConnection,
  getManager,
  Repository,
  Transaction,
} from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { Instrument } from "../instruments/models/instrument.entity";
import { InstrumentInput } from "../instruments/models/instrument-input.dto";

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
      skip: offset ?? 0,
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
    return await getManager().transaction("READ COMMITTED", async (manager) => {
      await this.instrumentsService.insertIfNotExist(quote.instrument, manager);
      let inst: Instrument = await this.instrumentsService.findOneOrFail(
        quote.instrument.instrumentTicker,
        manager
      );
      return await this.saveQuote({ ...quote, instrument: inst }, manager);
    });
  }

  async saveQuote(
    quote: DeepPartial<Quote>,
    entityManager: EntityManager = null
  ) {
    return await (entityManager ?? getManager()).save(
      Quote,
      (entityManager ?? getManager()).create(Quote, quote)
    );
  }
}
