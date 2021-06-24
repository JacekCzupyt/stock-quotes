import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { InstrumentsService } from "./instruments.service";
import { InstrumentMutation } from "./models/instrument-mutation.dto";
import { Instrument } from "./models/instrument.entity";

@Resolver((of) => Instrument)
export class InstrumentsResolver {
  constructor(private instrumentsService: InstrumentsService) {}

  @Query(() => [Instrument])
  async getInstruments(): Promise<Instrument[]> {
    return this.instrumentsService.getAll();
  }

  @Query(() => Instrument)
  async getInstrument(
    @Args("instrumentTicker")
    instrumentTicker: string
  ): Promise<Instrument> {
    return this.instrumentsService.getOne(instrumentTicker);
  }

  @Mutation(() => Instrument)
  async addInstrument(
    @Args("newInstrument") newInstrument: InstrumentMutation
  ): Promise<Instrument> {
    return this.instrumentsService.addNew(newInstrument);
  }
}
