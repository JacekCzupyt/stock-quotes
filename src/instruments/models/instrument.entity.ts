import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Quote } from "../../quotes/models/quote.entity";

@ObjectType()
@Entity()
export class Instrument {
  @Field()
  @PrimaryColumn()
  instrumentTicker: string;

  @Field()
  @Column()
  instrumentName: string;

  @Field(() => [Quote])
  @OneToMany((type) => Quote, (quote) => quote.instrument, {
    lazy: true,
  })
  quotes: Quote[];
}
