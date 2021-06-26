import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, Repository } from "typeorm";
import { InstrumentInput } from "./models/instrument-input.dto";
import { Instrument } from "./models/instrument.entity";

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(Instrument)
    private instrumentsRepository: Repository<Instrument>
  ) {}

  async getAll(num?: number, offset?: number): Promise<Instrument[]> {
    //DefalutPageSize can be swapped for some default value if we want pagiantion by default
    const DefalutPageSize = undefined;

    return this.instrumentsRepository.find({
      take: num ?? DefalutPageSize,
      skip: offset ?? 0,
    });
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

  async addNew(instrumentInput: InstrumentInput): Promise<Instrument> {
    //check if instrument with this ticker already exists
    const existingInstrument = await this.instrumentsRepository.findOne(
      instrumentInput.instrumentTicker
    );
    if (existingInstrument) {
      throw new BadRequestException(
        `Instrument with ticker "${instrumentInput.instrumentTicker}" already exists`
      );
    }
    //if no instrument name is provided, it will default to be the same as the ticker
    return this.instrumentsRepository.save({
      ...instrumentInput,
      instrumentName:
        instrumentInput.instrumentName ?? instrumentInput.instrumentTicker,
    });
  }
}
