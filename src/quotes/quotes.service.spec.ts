import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { InstrumentsModule } from "../instruments/instruments.module";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { QuotesService } from "./quotes.service";

describe("QuotesService", () => {
  let service: QuotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotesService],
      imports: [InstrumentsModule],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getQuotes", () => {
    it("should return an array of qoutes", () => {
      expect(service.getAll()).toEqual(QuotesService.defaultArrayState());
    });
  });

  describe("getQuote", () => {
    it("should return a qoute", () => {
      expect(service.getOne({ id: 1 })).toEqual(
        QuotesService.defaultArrayState()[1]
      );
    });
    it("should throw an error", () => {
      const call = () => service.getOne({ id: -1 });
      expect(call).toThrowError(NotFoundException);
      expect(call).toThrowError('No quote with id "-1"');
    });
  });

  describe("addQuote", () => {
    it("should add an quote to the array", () => {
      let quote: QuoteMutation = {
        instrument: "AAPL",
        timestamp: new Date(100),
        price: 200,
      };

      expect(service.addNew(quote)).toEqual({
        id: 3,
        ...quote,
      });

      expect(service.getOne({ id: 3 })).toEqual({
        id: 3,
        ...quote,
      });
    });

    it("should throw an error", () => {
      let quote: QuoteMutation = {
        instrument: "INVALID-TICKER",
        timestamp: new Date(100),
        price: 200,
      };

      const call = () => service.addNew(quote);
      expect(call).toThrowError(NotFoundException);
      expect(call).toThrowError('No instrument with ticker "INVALID-TICKER"');
    });
  });
});
