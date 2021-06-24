import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class QuoteInput {
  @Field()
  instrument: string;

  @Field()
  timestamp: Date;

  @Field((type) => Int, { description: "Price in cents" })
  price: number;
}
