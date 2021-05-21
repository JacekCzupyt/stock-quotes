import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { InstrumentsService } from "./instruments.service";
import { Instrument } from "./models/instrument-query.dto";

@Resolver((of) => Instrument)
export class InstrumentsResolver {
  constructor(private instrumentsService: InstrumentsService) {}

  @Query((returns) => String)
  test() {
    return "test";
  }

  @Query(() => [Instrument])
  getInstruments(): Instrument[] {
    return this.instrumentsService.getAll();
  }

  @Query(() => Instrument)
  getInstrument(@Args("instrumentId", { type: () => Int }) id: number) {
    return this.instrumentsService.getOne(id);
  }
}
