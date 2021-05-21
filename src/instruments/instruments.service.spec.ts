import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { InstrumentsService } from "./instruments.service";

describe("InstrumentsService", () => {
  let service: InstrumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstrumentsService],
    }).compile();

    service = module.get<InstrumentsService>(InstrumentsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAllInstruments", () => {
    it("should return an array of instruments", () => {
      expect(service.getAll()).toEqual([
        {
          instrument_ticker: "AAPL",
          instrument_name: "Apple Inc",
        },
        {
          instrument_ticker: "GOOGL",
          instrument_name: "Alphabet Inc Class A",
        },
      ]);
    });
  });

  describe("getOneInstrument", () => {
    it("should return an instrument", () => {
      expect(service.getOne({ instrument_ticker: "AAPL" })).toEqual({
        instrument_ticker: "AAPL",
        instrument_name: "Apple Inc",
      });
    });
    it("should throw an error", () => {
      const call = () =>
        service.getOne({ instrument_ticker: "invalid ticker" });
      expect(call).toThrowError(NotFoundException);
      expect(call).toThrowError('No instrument with ticker "invalid ticker"');
    });
  });
});
