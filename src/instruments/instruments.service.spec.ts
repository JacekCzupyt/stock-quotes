import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { EntityNotFoundError, QueryFailedError, Repository } from "typeorm";
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
            insert: jest.fn().mockImplementation(async (inst) => null),
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
      await expect(
        service.addNew({
          instrumentTicker: "AAPL",
          instrumentName: "Apple Inc",
        })
      ).resolves.toEqual({
        instrumentTicker: "AAPL",
        instrumentName: "Apple Inc",
        quotes: [],
      });

      expect(repo.insert).toBeCalledTimes(1);
      expect(repo.insert).toBeCalledWith({
        instrumentTicker: "AAPL",
        instrumentName: "Apple Inc",
      });

      expect(repo.findOne).toBeCalledTimes(1);
      expect(repo.findOne).toBeCalledWith("AAPL");
    });

    it("should add an instruemnt with default name", async () => {
      const findOneSpy = jest.spyOn(repo, "findOne").mockResolvedValue({
        instrumentTicker: "TEST",
        instrumentName: "TEST",
        quotes: [],
      });

      await expect(
        service.addNew({
          instrumentTicker: "TEST",
        })
      ).resolves.toEqual({
        instrumentTicker: "TEST",
        instrumentName: "TEST",
        quotes: [],
      });

      expect(repo.insert).toBeCalledTimes(1);
      expect(repo.insert).toBeCalledWith({
        instrumentTicker: "TEST",
        instrumentName: "TEST",
      });

      expect(repo.findOne).toBeCalledTimes(1);
      expect(repo.findOne).toBeCalledWith("TEST");
    });

    it("should throw an error", async () => {
      const insertSpy = jest
        .spyOn(repo, "insert")
        .mockRejectedValue(new QueryFailedError("", [], ""));

      const call = () =>
        service.addNew({
          instrumentTicker: "AAPL",
          instrumentName: "instrument with duplicate id",
        });
      await expect(call()).rejects.toThrowError(BadRequestException);
      await expect(call()).rejects.toThrowError(
        'Instrument with ticker "AAPL" already exists'
      );

      expect(repo.insert).toBeCalledTimes(2);
      expect(repo.insert).toBeCalledWith({
        instrumentTicker: "AAPL",
        instrumentName: "instrument with duplicate id",
      });
      expect(repo.findOne).toBeCalledTimes(0);
    });
  });
});
