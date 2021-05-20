import { Query, Resolver } from "@nestjs/graphql";
import { InstrumentsService } from "./instruments.service";
import { Instrument } from "./models/instrument.model";

@Resolver((of) => Instrument)
export class InstrumentsResolver {
  constructor(private instrumentsService: InstrumentsService) {}

  @Query((returns) => String)
  test() {
    return "test";
  }
}
