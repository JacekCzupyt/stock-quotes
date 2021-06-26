import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { EntityNotFoundError, Repository } from "typeorm";
import { InstrumentsService } from "./instruments.service";
import { Instrument } from "./models/instrument.entity";

const instrumentsArray: Instrument[] = [
  {
    instrumentTicker: "AAPL",
    instrumentName: "Apple Inc",
    quotes: [],
  },
  {
    instrumentTicker: "GOOGL",
    instrumentName: "Alphabet Inc Class A",
    quotes: [],
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
            findOne: jest.fn().mockResolvedValue(instrumentsArray[0]),
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
      await expect(service.getAll()).resolves.toEqual(instrumentsArray);
    });
  });

  describe("getOneInstrument", () => {
    it("should return an instrument", async () => {
      const repoSpy = jest.spyOn(repo, "findOneOrFail");
      await expect(service.getOne("AAPL")).resolves.toEqual(
        instrumentsArray[0]
      );
      expect(repoSpy).toBeCalledWith("AAPL");
    });
    it("should throw an error", async () => {
      const repoSpy = jest
        .spyOn(repo, "findOneOrFail")
        .mockImplementation((id) => {
          throw new EntityNotFoundError(Instrument, id);
        });

      const call = () => service.getOne("invalid ticker");
      await expect(call()).rejects.toThrowError(NotFoundException);
      await expect(call()).rejects.toThrowError(
        'No instrument with ticker "invalid ticker"'
      );

      expect(repoSpy).toBeCalledWith("invalid ticker");
    });
  });

  describe("addInstrument", () => {
    it("should add an instruemnt", async () => {
      const repoSpy = jest
        .spyOn(repo, "findOne")
        .mockImplementation(async (e) => {
          return Promise.resolve(null);
        });

      await expect(
        service.addNew({
          instrumentTicker: "TEST",
          instrumentName: "test-instrument",
        })
      ).resolves.toEqual({
        instrumentTicker: "TEST",
        instrumentName: "test-instrument",
        quotes: Promise.resolve([]),
      });

      expect(repo.findOne).toBeCalledTimes(1);
      expect(repo.findOne).toBeCalledWith("TEST");

      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith({
        instrumentTicker: "TEST",
        instrumentName: "test-instrument",
      });
    });

    it("should add an instruemnt with default name", async () => {
      const repoSpy = jest
        .spyOn(repo, "findOne")
        .mockImplementation(async (e) => {
          return Promise.resolve(null);
        });

      await expect(
        service.addNew({
          instrumentTicker: "TEST",
        })
      ).resolves.toEqual({
        instrumentTicker: "TEST",
        instrumentName: "TEST",
        quotes: Promise.resolve([]),
      });

      expect(repo.findOne).toBeCalledTimes(1);
      expect(repo.findOne).toBeCalledWith("TEST");

      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith({
        instrumentTicker: "TEST",
        instrumentName: "TEST",
      });
    });

    it("should throw an error", async () => {
      const call = () =>
        service.addNew({
          instrumentTicker: "AAPL",
          instrumentName: "instrument with duplicate id",
        });
      await expect(call()).rejects.toThrowError(BadRequestException);
      await expect(call()).rejects.toThrowError(
        'Instrument with ticker "AAPL" already exists'
      );

      expect(repo.findOne).toBeCalledTimes(2);
      expect(repo.findOne).toBeCalledWith("AAPL");
      expect(repo.save).toBeCalledTimes(0);
    });
  });
});
