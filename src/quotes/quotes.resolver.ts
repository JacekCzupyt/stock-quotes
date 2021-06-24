import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
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
    @Args("id", { type: () => Int })
    quoteId: number
  ): Promise<Quote> {
    return this.quotesService.getOne(quoteId);
  }

  @Mutation(() => Quote)
  async addQuote(@Args("newQuote") newQuote: QuoteMutation): Promise<Quote> {
    return this.quotesService.addNew(newQuote);
  }
}
