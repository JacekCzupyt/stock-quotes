import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { InstrumentInput } from "./models/instrument-input.dto";
import { InstrumentMutation } from "./models/instrument-mutation.dto";
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
        `No instrument with ticker "${input_instrument.instrument_ticker}"`
      );
    }
    return found_instrument;
  }

  addNew(instrument: InstrumentMutation): Instrument {
    const found_instrument = this.instruments.find(
      (inst) => inst.instrument_ticker === instrument.instrument_ticker
    );
    if (found_instrument) {
      throw new BadRequestException(
        `Instrument with ticker "${instrument.instrument_ticker}" already exists`
      );
    }
    return this.instruments[this.instruments.push({ ...instrument }) - 1];
  }
}
