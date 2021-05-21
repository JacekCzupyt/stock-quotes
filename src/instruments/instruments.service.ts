import { Injectable, NotImplementedException } from "@nestjs/common";
import { Instrument } from "./models/instrument.model";

@Injectable()
export class InstrumentsService {
  getAll(): Instrument[] {
    throw new NotImplementedException();
  }

  getOne(id: number): Instrument {
    throw new NotImplementedException();
  }
}
