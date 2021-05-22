import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType()
export class QuoteInput {
  @Field((type) => Int)
  id: number;
}
