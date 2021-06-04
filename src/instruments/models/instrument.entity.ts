import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class InstrumentEntity {
  @PrimaryColumn()
  instrument_ticker: string;

  @Column()
  instrument_name: string;

  //TODO: figure out relation
  //@Field(() => [Quote])
  //quotes?;
}
