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
      expect(service.getAll()).resolves.toEqual(instrumentsArray);
    });
  });

  describe("getOneInstrument", () => {
    it("should return an instrument", () => {
      const repoSpy = jest.spyOn(repo, "findOneOrFail");
      expect(service.getOne("AAPL")).resolves.toEqual(instrumentsArray[0]);
      expect(repoSpy).toBeCalledWith("AAPL");
    });
    it("should throw an error", () => {
      const repoSpy = jest
        .spyOn(repo, "findOneOrFail")
        .mockImplementation((id) => {
          throw new EntityNotFoundError(Instrument, id);
        });

      const call = () => service.getOne("invalid ticker");
      expect(call()).rejects.toThrowError(NotFoundException);
      expect(call()).rejects.toThrowError(
        'No instrument with ticker "invalid ticker"'
      );

      expect(repoSpy).toBeCalledWith("invalid ticker");
    });
  });

  describe("addInstrument", () => {
    it("should add an instruemnt", () => {
      const repoSpy = jest
        .spyOn(repo, "findOne")
        .mockImplementation(async (e) => {
          return Promise.resolve(null);
        });

      expect(
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

      //TODO: figure out why this fails
      //For some reason jest states that repo.save is never called
      //I've sepnt 3 hours trying to fix it now, the debugger sees it triggered,
      //it returns the correct result, all other tests work, things that depend
      //on repo.save work, I don't understand why it fails.
      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith({
        instrumentTicker: "TEST",
        instrumentName: "test-instrument",
      });
    });

    it("should add an instruemnt with default name", () => {
      const repoSpy = jest
        .spyOn(repo, "findOne")
        .mockImplementation(async (e) => {
          return Promise.resolve(null);
        });

      expect(
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

      //TODO: figure out why this fails
      //read comment in test above
      expect(repo.save).toBeCalledTimes(1);
      expect(repo.save).toBeCalledWith({
        instrumentTicker: "TEST",
        instrumentName: "TEST",
      });
    });

    it("should throw an error", () => {
      const call = () =>
        service.addNew({
          instrumentTicker: "AAPL",
          instrumentName: "instrument with duplicate id",
        });
      expect(call()).rejects.toThrowError(BadRequestException);
      expect(call()).rejects.toThrowError(
        'Instrument with ticker "AAPL" already exists'
      );

      expect(repo.findOne).toBeCalledTimes(2);
      expect(repo.findOne).toBeCalledWith("AAPL");
      expect(repo.save).toBeCalledTimes(0);
    });
  });
});
