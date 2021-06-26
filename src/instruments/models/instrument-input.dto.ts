import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class InstrumentInput {
  @Field()
  instrumentTicker: string;

  @Field({ nullable: true })
  instrumentName?: string;
}
