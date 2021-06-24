import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, Repository } from "typeorm";
import { InstrumentInput } from "./models/instrument-input.dto";
import { InstrumentMutation } from "./models/instrument-mutation.dto";
import { Instrument } from "./models/instrument.entity";

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(Instrument)
    private instrumentsRepository: Repository<Instrument>
  ) {}

  async getAll(): Promise<Instrument[]> {
    return this.instrumentsRepository.find();
  }

  async getOne(input_instrument: InstrumentInput): Promise<Instrument> {
    try {
      return await this.instrumentsRepository.findOneOrFail(
        input_instrument.instrument_ticker
      );
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `No instrument with ticker "${input_instrument.instrument_ticker}"`
        );
      } else {
        throw e;
      }
    }
  }

  async addNew(instrument: InstrumentMutation): Promise<Instrument> {
    //check if instrument with this ticker already exists

    const existingInstrument = await this.instrumentsRepository.findOne(
      instrument.instrument_ticker
    )
    if(existingInstrument){
      throw new BadRequestException(
        `Instrument with ticker "${instrument.instrument_ticker}" already exists`
      )
    }
    return this.instrumentsRepository.save({ ...instrument });
  }
}
