import { forwardRef, Inject, NotImplementedException } from "@nestjs/common";
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { InstrumentsService } from "../instruments/instruments.service";
import { Instrument } from "../instruments/models/instrument-query.dto";
import { QuoteInput } from "./models/quote-input.dto";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { Quote } from "./models/quote-query.dto";
import { QuotesService } from "./quotes.service";

@Resolver(() => Quote)
export class QuotesResolver {
  constructor(
    private readonly quotesService: QuotesService,
    //@Inject(forwardRef(() => InstrumentsService))
    private readonly instrumentsService: InstrumentsService
  ) {}

  @Query(() => [Quote])
  getQuotes(): Quote[] {
    return this.quotesService.getAll();
  }

  @Query(() => Quote)
  getQuote(
    @Args("quoteInput")
    quote_input: QuoteInput
  ) {
    return this.quotesService.getOne(quote_input);
  }

  @Mutation(() => Quote)
  addQuote(@Args("newQuote") new_Quote: QuoteMutation): Quote {
    return this.quotesService.addNew(new_Quote);
  }

  @ResolveField("instrument", (returns) => Instrument)
  getInstrument(@Parent() quote: Quote) {
    return this.instrumentsService.getOne({
      instrument_ticker: quote.instrument,
    });
  }
}
