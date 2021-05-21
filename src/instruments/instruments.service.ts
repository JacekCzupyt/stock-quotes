import { Injectable, NotFoundException } from "@nestjs/common";
import { InstrumentInput } from "./models/instrument-input.dto";
import { Instrument } from "./models/instrument-query.dto";

@Injectable()
export class InstrumentsService {
  private instruments: Instrument[] = [
    {
      instrument_ticker: "AAPL",
      instrument_name: "Apple Inc",
    },
    {
      instrument_ticker: "GOOGL",
      instrument_name: "Alphabet Inc Class A",
    },
  ];

  getAll(): Instrument[] {
    return this.instruments;
  }

  getOne(input_instrument: InstrumentInput): Instrument {
    const found_instrument = this.instruments.find(
      (inst) => inst.instrument_ticker === input_instrument.instrument_ticker
    );
    if (!found_instrument) {
      throw new NotFoundException(
        `No instrument with ticker ${input_instrument.instrument_ticker}`
      );
    }
    return found_instrument;
  }
}
