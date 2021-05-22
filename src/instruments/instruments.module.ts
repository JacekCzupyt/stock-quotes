import { forwardRef, Module } from "@nestjs/common";
import { QuotesModule } from "../quotes/quotes.module";
import { InstrumentsResolver } from "./instruments.resolver";
import { InstrumentsService } from "./instruments.service";

@Module({
  providers: [InstrumentsResolver, InstrumentsService],
  exports: [InstrumentsService],
  imports: [forwardRef(() => QuotesModule)],
})
export class InstrumentsModule {}
