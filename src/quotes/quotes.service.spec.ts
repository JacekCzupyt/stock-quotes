import { forwardRef, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { InstrumentInput } from "../instruments/models/instrument-input.dto";
import { InstrumentsModule } from "../instruments/instruments.module";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { QuotesService } from "./quotes.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Quote } from "./models/quote.entity";
import { EntityNotFoundError, Repository } from "typeorm";
import { InstrumentsService } from "../instruments/instruments.service";
import { Instrument } from "../instruments/models/instrument.entity";

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
  instrument_ticker: "AAPL",
  instrument_name: "Apple Inc",
  quotes: Promise.resolve([]),
};

describe("QuotesService", () => {
  let service: QuotesService;
  let repo: Repository<Quote>;
  let instrumentService: InstrumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        {
          provide: getRepositoryToken(Quote),
          useValue: {
            find: jest.fn().mockResolvedValue(quotesArray),
            findOneOrFail: jest.fn().mockResolvedValue(quotesArray[0]),
            save: jest
              .fn()
              .mockImplementation(async (quote): Promise<Quote> => {
                return { ...quote, id: 1 };
              }),
          },
        },
        {
          provide: InstrumentsService,
          useValue: {
            getOne: jest.fn().mockResolvedValue(mockInstrument),
          },
        },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
    instrumentService = module.get<InstrumentsService>(InstrumentsService);
    repo = module.get<Repository<Quote>>(getRepositoryToken(Quote));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getQuotes", () => {
    it("should return an array of qoutes", () => {
      expect(service.getAll()).resolves.toEqual(quotesArray);
    });
  });

  describe("getQuote", () => {
    it("should return a qoute", () => {
      expect(service.getOne({ id: 1 })).resolves.toEqual(quotesArray[1]);
      expect(repo.findOneOrFail).toBeCalledWith(1);
    });
    it("should throw an error", () => {
      const repoSpy = jest
        .spyOn(repo, "findOneOrFail")
        .mockImplementation((id) => {
          throw new EntityNotFoundError(Quote, id);
        });

      const call = () => service.getOne({ id: -1 });
      expect(call()).resolves.toThrowError(NotFoundException);
      expect(call()).resolves.toThrowError('No quote with id "-1"');

      expect(repoSpy).toBeCalledWith(-1);
    });
  });

  describe("addQuote", () => {
    it("should add an quote to the array", () => {
      expect(service.addNew(quoteMutation)).resolves.toEqual({
        ...quoteMutation,
        instrument: mockInstrument,
        id: 1,
      });

      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith({
        ...quoteMutation,
        instrument: mockInstrument,
      });

      expect(instrumentService.getOne).toBeCalledTimes(1);
      expect(instrumentService.getOne).toBeCalledWith(quoteMutation.instrument);
    });

    it("should throw an error", () => {
      const repoSpy = jest
        .spyOn(instrumentService, "getOne")
        .mockRejectedValue(
          new NotFoundException(`No instrument with ticker "AAPL"`)
        );

      const call = () => service.addNew(quoteMutation);
      expect(call()).toThrowError(NotFoundException);
      expect(call()).toThrowError('No instrument with ticker "AAPL"');

      expect(repo.save).toBeCalledTimes(0);
    });
  });

  // describe("getQuotesByInstrument", () => {
  //   it("should return an array of quotes", () => {
  //     let input: InstrumentInput = { instrument_ticker: "AAPL" };

  //     expect(service.getByInstrument(input)).toEqual([
  //       {
  //         id: 0,
  //         instrument: "AAPL",
  //         timestamp: new Date(1621620906000),
  //         price: 12600,
  //       },
  //       {
  //         id: 2,
  //         instrument: "AAPL",
  //         timestamp: new Date(1621620906000 - 1000 * 3600 * 24),
  //         price: 12720,
  //       },
  //     ]);
  //   });
  // });
});
