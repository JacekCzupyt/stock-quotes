import { NotImplementedException } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { IntSupportOption } from "prettier";
import { QuotesService } from "src/quotes/quotes.service";
import { Quote } from "../quotes/models/quote-query.dto";
import { InstrumentsModule } from "./instruments.module";
import { InstrumentsService } from "./instruments.service";
import { InstrumentInput } from "./models/instrument-input.dto";
import { InstrumentMutation } from "./models/instrument-mutation.dto";
import { Instrument } from "./models/instrument-query.dto";

@Resolver((of) => Instrument)
export class InstrumentsResolver {
  constructor(
    private instrumentsService: InstrumentsService,
    private quotesService: QuotesService
  ) {}

  @Query((returns) => String)
  test() {
    return "test";
  }

  @Query(() => [Instrument])
  getInstruments(): Instrument[] {
    return this.instrumentsService.getAll();
  }

  @Query(() => Instrument)
  getInstrument(
    @Args("instrumentTicker")
    input_instrument: InstrumentInput
  ) {
    return this.instrumentsService.getOne(input_instrument);
  }

  @Mutation(() => Instrument)
  addInstrument(
    @Args("newInstrument") newInstrument: InstrumentMutation
  ): Instrument {
    return this.instrumentsService.addNew(newInstrument);
  }

  @ResolveField("quotes", (returns) => [Quote])
  getQuotes(@Parent() instrument: Instrument) {
    return this.quotesService.getByInstrument({
      instrument_ticker: instrument.instrument_ticker,
    });
  }
}
