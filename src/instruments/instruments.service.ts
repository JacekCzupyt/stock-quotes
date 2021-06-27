import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, QueryFailedError, Repository } from "typeorm";
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
    try {
      //transactions are enabled by default for the insert operation, therfore a duplicate instrument
      //will never be inserted because of concurent requests, instead an QueryFailedError will be thrown
      let result = await this.instrumentsRepository.insert({
        ...instrumentInput,
        instrumentName:
          instrumentInput.instrumentName ?? instrumentInput.instrumentTicker,
      });
      return await this.instrumentsRepository.findOne(
        instrumentInput.instrumentTicker
      );
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new BadRequestException(
          `Instrument with ticker "${instrumentInput.instrumentTicker}" already exists`
        );
      } else {
        throw e;
      }
    }
  }
}
