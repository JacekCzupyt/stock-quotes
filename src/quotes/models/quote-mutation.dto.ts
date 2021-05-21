import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType()
export class QuoteMutation {
  @Field()
  instrument: string;

  @Field()
  timestamp: Date;

  @Field((type) => Int, { description: "Price in cents" })
  price: number;
}
