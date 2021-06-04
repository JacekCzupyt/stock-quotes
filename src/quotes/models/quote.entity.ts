import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class QuoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  //TODO: figure out relations
  @Column()
  instrument: string;

  @Column()
  timestamp: Date;

  @Column()
  price: number;
}
