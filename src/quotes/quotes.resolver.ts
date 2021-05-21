import { NotImplementedException } from "@nestjs/common";
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Instrument } from "src/instruments/models/instrument-query.dto";
import { QuoteInput } from "./models/quote-input.dto";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { Quote } from "./models/quote-query.dto";
import { QuotesService } from "./quotes.service";

@Resolver(() => Quote)
export class QuotesResolver {
  constructor(private readonly quotesService: QuotesService) {}

  @Query(() => [Quote])
  getQuotes(): Quote[] {
    throw new NotImplementedException();
  }

  @Query(() => Quote)
  getQuote(
    @Args("quoteInput")
    qoute_input: QuoteInput
  ) {
    throw new NotImplementedException();
  }

  @Mutation(() => Quote)
  addQuote(@Args("newQuote") new_Quote: QuoteMutation): Quote {
    throw new NotImplementedException();
  }

  @ResolveField("instrument", (returns) => Instrument)
  getInstrument(@Parent() quote: Quote) {
    throw new NotImplementedException();
  }
}
