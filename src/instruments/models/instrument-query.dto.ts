import { Field, ObjectType } from "@nestjs/graphql";
import { Quote } from "../../quotes/models/quote-query.dto";

@ObjectType()
export class Instrument {
  @Field()
  instrument_ticker: string;

  @Field()
  instrument_name: string;

  @Field(() => [Quote])
  quotes?;
}
