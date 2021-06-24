import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, Repository } from "typeorm";
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

  async getOne(instrumentTicker: string): Promise<Instrument> {
    try {
      return await this.instrumentsRepository.findOneOrFail(instrumentTicker);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `No instrument with ticker "${instrumentTicker}"`
        );
      } else {
        throw e;
      }
    }
  }

  async addNew(instrument: InstrumentMutation): Promise<Instrument> {
    //check if instrument with this ticker already exists

    const existingInstrument = await this.instrumentsRepository.findOne(
      instrument.instrumentTicker
    );
    if (existingInstrument) {
      throw new BadRequestException(
        `Instrument with ticker "${instrument.instrumentTicker}" already exists`
      );
    }
    return this.instrumentsRepository.save({ ...instrument });
  }
}
