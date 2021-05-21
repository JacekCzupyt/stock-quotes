import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Instrument {
  @Field()
  instrument_ticker: string;

  @Field()
  instrument_name: string;
}
