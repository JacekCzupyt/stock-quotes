import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Instrument } from "src/instruments/models/instrument.model";

@ObjectType()
export class Quote {
  @Field((type) => Int)
  id: number;

  @Field((type) => Instrument)
  instrument: Instrument;

  @Field()
  timestamp: Date;

  /*
  Possible problem with intiger overflow for large values
  One solution would to to change from Int to Float,
  however I understand that in general floats should not be used to handle money due to inprecision,
  not sure if it applies in this context though.
  Another soulution would be to increase this to a 64 bit intiger,
  however I haven't been able to find an effective way to do this
  (graphql does not have a Long type), and some posts suggested
  that Int can already support long intigers depanding on the context.
  */
  @Field((type) => Int, { description: "Price in cents" })
  price: number;
}
