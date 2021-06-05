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
import { Instrument } from "../instruments/models/instrument.entity";
import { QuoteInput } from "./models/quote-input.dto";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { Quote } from "./models/quote.entity";
import { QuotesService } from "./quotes.service";

@Resolver(() => Quote)
export class QuotesResolver {
  constructor(private readonly quotesService: QuotesService) {}

  @Query(() => [Quote])
  async getQuotes(): Promise<Quote[]> {
    return this.quotesService.getAll();
  }

  @Query(() => Quote)
  async getQuote(
    @Args("quoteInput")
    quote_input: QuoteInput
  ): Promise<Quote> {
    return this.quotesService.getOne(quote_input);
  }

  @Mutation(() => Quote)
  async addQuote(@Args("newQuote") new_Quote: QuoteMutation): Promise<Quote> {
    return this.quotesService.addNew(new_Quote);
  }
}
