import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Instrument {
  @Field()
  instrumnet_ticker: string;

  @Field()
  instrument_name: string;
}
