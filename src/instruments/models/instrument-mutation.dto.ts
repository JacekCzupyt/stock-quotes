import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class InstrumentMutation {
  @Field()
  instrument_name: string;
}
