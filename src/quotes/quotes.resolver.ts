import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
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
