import { forwardRef, Module } from "@nestjs/common";
import { InstrumentsModule } from "../instruments/instruments.module";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

@Module({
  imports: [forwardRef(() => InstrumentsModule)],
  providers: [QuotesResolver, QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
