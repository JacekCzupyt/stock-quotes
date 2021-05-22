import { Module } from "@nestjs/common";
import { InstrumentsResolver } from "./instruments.resolver";
import { InstrumentsService } from "./instruments.service";

@Module({
  providers: [InstrumentsResolver, InstrumentsService],
  exports: [InstrumentsService],
})
export class InstrumentsModule {}
