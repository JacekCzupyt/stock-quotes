import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Instrument } from "src/instruments/models/instrument.entity";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { Quote } from "./models/quote.entity";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

const quotesArray: Quote[] = [
  {
    id: 0,
    instrument: null,
    timestamp: new Date(1621620906000),
    price: 12600,
  },
  {
    id: 1,
    instrument: null,
    timestamp: new Date(1621620906000 - 1000 * 3600 * 24),
    price: 229538,
  },
  {
    id: 2,
    instrument: null,
    timestamp: new Date(1621620906000 - 1000 * 3600 * 24),
    price: 12720,
  },
];

let quoteMutation: QuoteMutation = {
  instrument: "AAPL",
  timestamp: new Date(100),
  price: 200,
};

let mockInstrument: Instrument = {
  instrumentTicker: "AAPL",
  instrumentName: "Apple Inc",
  quotes: [],
};

describe("QuotesResolver", () => {
  let resolver: QuotesResolver;
  let service: QuotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesResolver,
        {
          provide: QuotesService,
          useValue: {
            getAll: jest.fn().mockResolvedValue(quotesArray),
            getOne: jest.fn().mockResolvedValue(quotesArray[0]),
            addNew: jest
              .fn()
              .mockImplementation(
                async (quote: QuoteMutation): Promise<Quote> => {
                  return { ...quote, instrument: mockInstrument, id: 1 };
                }
              ),
          },
        },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
    resolver = module.get<QuotesResolver>(QuotesResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  describe("getQuotes", () => {
    it("should return an array of quotes", async () => {
      expect(resolver.getQuotes()).resolves.toBe(quotesArray);
    });
  });

  describe("getQuote", () => {
    it("should return a qoute", async () => {
      expect(resolver.getQuote(0)).resolves.toEqual(quotesArray[0]);
      expect(service.getOne).toBeCalledWith(0);
    });

    //Not sure if this test is nessesary

    it("should throw an error", async () => {
      jest.spyOn(service, "getOne").mockImplementation(async (id) => {
        throw new NotFoundException(`No quote with id "${id}"`);
      });

      expect(resolver.getQuote(-1)).rejects.toThrowError(NotFoundException);
      expect(resolver.getQuote(-1)).rejects.toThrowError(
        `No quote with id "-1"`
      );
    });
  });

  describe("addQuote", () => {
    it("should make a new quote", async () => {
      expect(resolver.addQuote(quoteMutation)).resolves.toEqual({
        ...quoteMutation,
        id: 1,
        instrument: mockInstrument,
      });

      expect(service.addNew).toBeCalledTimes(1);
      expect(service.addNew).toBeCalledWith(quoteMutation);
    });

    //Not sure if this test is nessesary

    it("should throw an error", async () => {
      const serviceSpy = jest
        .spyOn(service, "addNew")
        .mockImplementation(async (input) => {
          throw new BadRequestException(
            `No instrument with ticker "${input.instrument}"`
          );
        });

      expect(resolver.addQuote(quoteMutation)).rejects.toThrowError(
        BadRequestException
      );
      expect(resolver.addQuote(quoteMutation)).rejects.toThrowError(
        `No instrument with ticker "${quoteMutation.instrument}"`
      );
    });
  });
});
