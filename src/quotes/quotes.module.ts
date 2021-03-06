import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InstrumentsModule } from "../instruments/instruments.module";
import { Quote } from "./models/quote.entity";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

@Module({
  imports: [InstrumentsModule, TypeOrmModule.forFeature([Quote])],
  providers: [QuotesResolver, QuotesService],
})
export class QuotesModule {}
