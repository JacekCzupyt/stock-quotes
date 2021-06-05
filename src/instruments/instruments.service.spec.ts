import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { resolve } from "path";
import { EntityNotFoundError, Repository } from "typeorm";
import { InstrumentsService } from "./instruments.service";
import { Instrument } from "./models/instrument.entity";

const instrumentsArray: Instrument[] = [
  {
    instrument_ticker: "AAPL",
    instrument_name: "Apple Inc",
    quotes: Promise.resolve([]),
  },
  {
    instrument_ticker: "GOOGL",
    instrument_name: "Alphabet Inc Class A",
    quotes: Promise.resolve([]),
  },
];

describe("InstrumentsService", () => {
  let service: InstrumentsService;
  let repo: Repository<Instrument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        {
          provide: getRepositoryToken(Instrument),
          useValue: {
            find: jest.fn().mockResolvedValue(instrumentsArray),
            findOneOrFail: jest.fn().mockResolvedValue(instrumentsArray[0]),
            save: jest
              .fn()
              .mockImplementation(async (inst): Promise<Instrument> => {
                return { ...inst, quotes: Promise.resolve([]) };
              }),
          },
        },
      ],
    }).compile();

    service = module.get<InstrumentsService>(InstrumentsService);
    repo = module.get<Repository<Instrument>>(getRepositoryToken(Instrument));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAllInstruments", () => {
    it("should return an array of instruments", async () => {
      expect(service.getAll()).resolves.toEqual(instrumentsArray);
    });
  });

  describe("getOneInstrument", () => {
    it("should return an instrument", () => {
      const repoSpy = jest.spyOn(repo, "findOneOrFail");
      expect(service.getOne({ instrument_ticker: "AAPL" })).resolves.toEqual(
        instrumentsArray[0]
      );
      expect(repoSpy).toBeCalledWith("AAPL");
    });
    it("should throw an error", () => {
      const repoSpy = jest
        .spyOn(repo, "findOneOrFail")
        .mockImplementation((id) => {
          throw new EntityNotFoundError(Instrument, id);
        });

      const call = () =>
        service.getOne({ instrument_ticker: "invalid ticker" });
      expect(call()).resolves.toThrowError(NotFoundException);
      expect(call()).resolves.toThrowError(
        'No instrument with ticker "invalid ticker"'
      );

      expect(repoSpy).toBeCalledWith("invalid ticker");
    });
  });

  describe("addInstrument", () => {
    it("should add an instruemnt to the array", () => {
      const repoSpy = jest
        .spyOn(repo, "findOneOrFail")
        .mockImplementation((id) => {
          throw new EntityNotFoundError(Instrument, id);
        });

      expect(
        service.addNew({
          instrument_ticker: "TEST",
          instrument_name: "test-instrument",
        })
      ).resolves.toEqual({
        instrument_ticker: "TEST",
        instrument_name: "test-instrument",
        quotes: Promise.resolve([]),
      });

      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith({
        instrument_ticker: "TEST",
        instrument_name: "test-instrument",
      });

      expect(repo.findOneOrFail).toBeCalledTimes(1);
      expect(repo.findOneOrFail).toBeCalledWith("TEST");
    });

    it("should throw an error", () => {
      const call = () =>
        service.addNew({
          instrument_ticker: "AAPL",
          instrument_name: "instrument with duplicate id",
        });
      expect(call()).resolves.toThrowError(BadRequestException);
      expect(call()).resolves.toThrowError(
        'Instrument with ticker "AAPL" already exists'
      );

      expect(repo.findOneOrFail).toBeCalledTimes(2);
      expect(repo.findOneOrFail).toBeCalledWith("AAPL");
      expect(repo.save).toBeCalledTimes(0);
    });
  });
});
