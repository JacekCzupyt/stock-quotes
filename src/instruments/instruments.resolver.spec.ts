import { Test, TestingModule } from "@nestjs/testing";
import { InstrumentsResolver } from "./instruments.resolver";
import { InstrumentsService } from "./instruments.service";
import { Instrument } from "./models/instrument-query.dto";

describe("InstrumentsResolver", () => {
  let resolver: InstrumentsResolver;
  let service: InstrumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstrumentsResolver, InstrumentsService],
    }).compile();

    service = module.get<InstrumentsService>(InstrumentsService);
    resolver = module.get<InstrumentsResolver>(InstrumentsResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  describe("getInstruments", () => {
    it("should return an array of instruments", async () => {
      const result: Instrument[] = [
        {
          instrument_ticker: "test-ticker",
          instrument_name: "test-name",
        },
      ];
      jest.spyOn(service, "getAll").mockImplementation(() => result);

      expect(await resolver.getInstruments()).toBe(result);
    });
  });

  describe("getInstrument", () => {
    it("should return an instrument", async () => {
      const result: Instrument = {
        instrument_ticker: "test-ticker",
        instrument_name: "test-name",
      };
      jest.spyOn(service, "getOne").mockImplementation((input) => ({
        instrument_ticker: input.instrument_ticker,
        instrument_name: result.instrument_name,
      }));

      expect(
        await resolver.getInstrument({
          instrument_ticker: result.instrument_ticker,
        })
      ).toEqual(result);
    });
  });
});
