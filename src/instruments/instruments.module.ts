import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuotesModule } from "../quotes/quotes.module";
import { InstrumentsResolver } from "./instruments.resolver";
import { InstrumentsService } from "./instruments.service";
import { InstrumentEntity } from "./models/instrument.entity";

@Module({
  providers: [InstrumentsResolver, InstrumentsService],
  exports: [InstrumentsService],
  imports: [
    forwardRef(() => QuotesModule),
    TypeOrmModule.forFeature([InstrumentEntity]),
  ],
})
export class InstrumentsModule {}
