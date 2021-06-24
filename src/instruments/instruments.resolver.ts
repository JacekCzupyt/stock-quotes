import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { InstrumentsService } from "./instruments.service";
import { InstrumentInput } from "./models/instrument-input.dto";
import { Instrument } from "./models/instrument.entity";

@Resolver((of) => Instrument)
export class InstrumentsResolver {
  constructor(private instrumentsService: InstrumentsService) {}

  @Query(() => [Instrument])
  async getInstruments(
    @Args("number", { type: () => Int, nullable: true })
    num?: number,
    @Args("offset", { type: () => Int, nullable: true })
    offset?: number
  ): Promise<Instrument[]> {
    return this.instrumentsService.getAll(num, offset);
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
    @Args("newInstrument") newInstrument: InstrumentInput
  ): Promise<Instrument> {
    return this.instrumentsService.addNew(newInstrument);
  }
}
