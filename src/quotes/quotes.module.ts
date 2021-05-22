import { Module } from "@nestjs/common";
import { InstrumentsModule } from "../instruments/instruments.module";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

@Module({
  imports: [InstrumentsModule],
  providers: [QuotesResolver, QuotesService],
})
export class QuotesModule {}
