import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { InstrumentsResolver } from "./instruments.resolver";
import { InstrumentsService } from "./instruments.service";
import { InstrumentInput } from "./models/instrument-input.dto";
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

const instrumentMutation: InstrumentInput = {
  instrumentTicker: "TEST",
  instrumentName: "test-instrument",
};

describe("InstrumentsResolver", () => {
  let resolver: InstrumentsResolver;
  let service: InstrumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstrumentsResolver,
        {
          provide: InstrumentsService,
          useValue: {
            getAll: jest.fn().mockResolvedValue(instrumentsArray),
            getOne: jest.fn().mockResolvedValue(instrumentsArray[0]),
            addNew: jest.fn().mockImplementation(async (arg) => ({
              instrumentTicker: "TEST",
              instrumentName: "test-instrument",
              quotes: Promise.resolve([]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<InstrumentsService>(InstrumentsService);
    resolver = module.get<InstrumentsResolver>(InstrumentsResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  describe("getInstruments", () => {
    it("should return an array of instruments", async () => {
      expect(resolver.getInstruments()).resolves.toBe(instrumentsArray);
    });
  });

  describe("getInstrument", () => {
    it("should return an instrument", async () => {
      expect(resolver.getInstrument("AAPL")).resolves.toEqual(
        instrumentsArray[0]
      );
      expect(service.getOne).toBeCalledWith("AAPL");
    });

    //Not sure if this test is nessesary

    it("should throw an error", async () => {
      jest
        .spyOn(service, "getOne")
        .mockImplementation(async (instrument_ticker) => {
          throw new NotFoundException(
            `No instrument with ticker "${instrument_ticker}"`
          );
        });

      let tick = "ticker";

      expect(resolver.getInstrument(tick)).rejects.toThrowError(
        NotFoundException
      );
      expect(resolver.getInstrument(tick)).rejects.toThrowError(
        `No instrument with ticker "${tick}"`
      );
    });
  });

  describe("addInstrument", () => {
    it("should make a new instrument", async () => {
      expect(resolver.addInstrument(instrumentMutation)).resolves.toEqual({
        ...instrumentMutation,
        quotes: Promise.resolve([]),
      });

      expect(service.addNew).toBeCalledTimes(1);
      expect(service.addNew).toBeCalledWith(instrumentMutation);
    });

    //Not sure if this test is nessesary

    it("should throw an error", async () => {
      const serviceSpy = jest
        .spyOn(service, "addNew")
        .mockImplementation(async (input) => {
          throw new BadRequestException(
            `No instrument with ticker "${input.instrumentTicker}"`
          );
        });

      expect(resolver.addInstrument(instrumentMutation)).rejects.toThrowError(
        BadRequestException
      );
      expect(resolver.addInstrument(instrumentMutation)).rejects.toThrowError(
        `No instrument with ticker "${instrumentMutation.instrumentTicker}"`
      );
    });
  });
});
