import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Instrument {
  @Field((type) => Int)
  id: number;

  @Field()
  instrument_name: string;
}
