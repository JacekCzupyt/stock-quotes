import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { QuoteInput } from "./models/quote-input.dto";
import { Quote } from "./models/quote.entity";
import { QuotesService } from "./quotes.service";

@Resolver(() => Quote)
export class QuotesResolver {
  constructor(private readonly quotesService: QuotesService) {}

  //TODO: add filters?
  @Query(() => [Quote])
  async getQuotes(
    @Args("number", { type: () => Int, nullable: true })
    num?: number,
    @Args("offset", { type: () => Int, nullable: true })
    offset?: number
  ): Promise<Quote[]> {
    return this.quotesService.getAll(num, offset);
  }

  @Query(() => Quote)
  async getQuote(
    @Args("id", { type: () => Int })
    quoteId: number
  ): Promise<Quote> {
    return this.quotesService.getOne(quoteId);
  }

  @Mutation(() => Quote)
  async addQuote(@Args("newQuote") newQuote: QuoteInput): Promise<Quote> {
    return this.quotesService.addNew(newQuote);
  }
}
