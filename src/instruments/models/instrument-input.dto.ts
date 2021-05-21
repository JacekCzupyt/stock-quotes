import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class InstrumentInput {
  @Field((type) => Int)
  id: number;
}
