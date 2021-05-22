import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class InstrumentMutation {
  @Field()
  instrument_ticker: string;

  @Field()
  instrument_name: string;
}
