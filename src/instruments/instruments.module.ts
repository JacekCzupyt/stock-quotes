import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InstrumentsResolver } from "./instruments.resolver";
import { InstrumentsService } from "./instruments.service";
import { Instrument } from "./models/instrument.entity";

@Module({
  providers: [InstrumentsResolver, InstrumentsService],
  exports: [InstrumentsService],
  imports: [TypeOrmModule.forFeature([Instrument])],
})
export class InstrumentsModule {}
