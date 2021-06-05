import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InstrumentInput } from "./models/instrument-input.dto";
import { InstrumentMutation } from "./models/instrument-mutation.dto";
import { Instrument } from "./models/instrument.entity";

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(Instrument)
    private instrumentsRepository: Repository<Instrument>
  ) {}

  //TODO: insert into repository
  // private instruments: Instrument[] = [
  //   {
  //     instrument_ticker: "AAPL",
  //     instrument_name: "Apple Inc",
  //     quotes: [],
  //   },
  //   {
  //     instrument_ticker: "GOOGL",
  //     instrument_name: "Alphabet Inc Class A",
  //     quotes: [],
  //   },
  // ];

  async getAll(): Promise<Instrument[]> {
    return this.instrumentsRepository.find();
  }

  async getOne(input_instrument: InstrumentInput): Promise<Instrument> {
    return this.instrumentsRepository.findOne(
      input_instrument.instrument_ticker
    );
    /*if (!found_instrument) {
      throw new NotFoundException(
        `No instrument with ticker "${input_instrument.instrument_ticker}"`
      );
    }
    return found_instrument;*/
  }

  async addNew(instrument: InstrumentMutation): Promise<Instrument> {
    return this.instrumentsRepository.save({ ...instrument });
    /*if (found_instrument) {
      throw new BadRequestException(
        `Instrument with ticker "${instrument.instrument_ticker}" already exists`
      );
    }
    return this.instruments[this.instruments.push({ ...instrument }) - 1];*/
  }
}
