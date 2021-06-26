import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { QuoteInput } from "./models/quote-input.dto";
import { QuotesService } from "./quotes.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Quote } from "./models/quote.entity";
import { EntityNotFoundError, Repository } from "typeorm";
import { InstrumentsService } from "../instruments/instruments.service";
import { Instrument } from "../instruments/models/instrument.entity";
import { InstrumentInput } from "src/instruments/models/instrument-input.dto";
import { BadRequestException } from "@nestjs/common";

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

let quoteMutation: QuoteInput = {
  instrument: { instrumentTicker: "AAPL", instrumentName: "input name" },
  timestamp: new Date(100),
  price: 200,
};

let mockInstrument: Instrument = {
  instrumentTicker: "AAPL",
  instrumentName: "Apple Inc",
  quotes: [],
};

let mockNewInstrument: Instrument = {
  instrumentTicker: "AAPL",
  instrumentName: "input name",
  quotes: [],
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
                return quote;
              }),
            create: jest.fn().mockImplementation(async (quote) => {
              return { ...quote, id: 1 };
            }),
          },
        },
        {
          provide: InstrumentsService,
          useValue: {
            getOne: jest.fn().mockResolvedValue(mockInstrument),
            addNew: jest.fn().mockResolvedValue(mockNewInstrument),
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
    it("should return an array of qoutes", async () => {
      await expect(service.getAll()).resolves.toEqual(quotesArray);
    });
  });

  describe("getQuote", () => {
    it("should return a qoute", async () => {
      await expect(service.getOne(1)).resolves.toEqual(quotesArray[0]);
      expect(repo.findOneOrFail).toBeCalledWith(1);
    });

    it("should throw an error", async () => {
      const repoSpy = jest
        .spyOn(repo, "findOneOrFail")
        .mockImplementation((id) => {
          throw new EntityNotFoundError(Quote, id);
        });

      const call = () => service.getOne(-1);
      await expect(call()).rejects.toThrowError(NotFoundException);
      await expect(call()).rejects.toThrowError('No quote with id "-1"');

      expect(repoSpy).toBeCalledTimes(2);
      expect(repoSpy).toBeCalledWith(-1);
    });
  });

  describe("addQuote", () => {
    it("should add a quote to an existing instrument", async () => {
      const addNewSpy = jest
        .spyOn(instrumentService, "addNew")
        .mockRejectedValue(
          new BadRequestException(
            `Instrument with ticker "${quoteMutation.instrument.instrumentTicker}" already exists`
          )
        );

      const call = () => service.addNew(quoteMutation);
      await expect(call()).resolves.toEqual({
        ...quoteMutation,
        instrument: mockInstrument,
        id: 1,
      });

      expect(instrumentService.addNew).toBeCalledTimes(1);
      expect(instrumentService.addNew).toBeCalledWith(quoteMutation.instrument);

      expect(instrumentService.getOne).toBeCalledTimes(1);
      expect(instrumentService.getOne).toBeCalledWith(
        quoteMutation.instrument.instrumentTicker
      );

      expect(repo.create).toBeCalledTimes(1);
      expect(repo.create).toBeCalledWith({
        ...quoteMutation,
        instrument: mockInstrument,
      });

      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith(
        Promise.reject({
          ...quoteMutation,
          instrument: mockInstrument,
          id: 1,
        })
      );
    });

    it("should add a quote to a new instrument", async () => {
      const call = () => service.addNew(quoteMutation);

      await expect(call()).resolves.toEqual({
        ...quoteMutation,
        instrument: mockNewInstrument,
        id: 1,
      });

      expect(instrumentService.addNew).toBeCalledTimes(1);
      expect(instrumentService.addNew).toBeCalledWith(quoteMutation.instrument);

      expect(instrumentService.getOne).toBeCalledTimes(0);

      expect(repo.create).toBeCalledTimes(1);
      expect(repo.create).toBeCalledWith({
        ...quoteMutation,
        instrument: mockNewInstrument,
      });

      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith(
        Promise.reject({
          ...quoteMutation,
          instrument: mockNewInstrument,
          id: 1,
        })
      );
    });
  });
});
