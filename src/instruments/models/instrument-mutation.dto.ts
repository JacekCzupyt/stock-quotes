import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class InstrumentMutation {
  @Field()
  instrumentTicker: string;

  @Field()
  instrumentName: string;
}
