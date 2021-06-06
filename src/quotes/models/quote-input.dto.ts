import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class QuoteInput {
  @Field((type) => Int)
  id: number;
}
