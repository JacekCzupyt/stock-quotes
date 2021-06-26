import { Field, InputType, Int } from "@nestjs/graphql";
import { InstrumentInput } from "../../instruments/models/instrument-input.dto";

@InputType()
export class QuoteInput {
  @Field((type) => InstrumentInput)
  instrument: InstrumentInput;

  @Field()
  timestamp: Date;

  @Field((type) => Int, { description: "Price in cents" })
  price: number;
}
