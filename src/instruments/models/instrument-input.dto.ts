import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class InstrumentInput {
  @Field()
  instrument_ticker: string;
}
