import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { QuotesModule } from "../quotes/quotes.module";
import { InstrumentsResolver } from "./instruments.resolver";
import { InstrumentsService } from "./instruments.service";
import { Instrument } from "./models/instrument-query.dto";

describe("InstrumentsResolver", () => {
  let resolver: InstrumentsResolver;
  let service: InstrumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstrumentsResolver, InstrumentsService],
      imports: [forwardRef(() => QuotesModule)],
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

    // TODO: is error handing nessesary here if it's already in the resolver? If so, how to implement properly?

    /*it("should throw an error", async () => {
      expect.assertions(1);

      jest.spyOn(service, "getOne").mockImplementation((input) => {
        throw new NotFoundException(
          `No instrument with ticker "${input.instrument_ticker}"`
        );
      });

      let tick = "ticker";

      await expect(
        await resolver.getInstrument({ instrument_ticker: tick })
      ).rejects.toEqual({ error: `No instrument with ticker "${tick}"` });
    });*/
  });

  describe("addInstrument", () => {
    it("should make a new instrument", async () => {
      jest.spyOn(service, "addNew").mockImplementation((arg) => ({
        instrument_ticker: arg.instrument_ticker,
        instrument_name: arg.instrument_name,
      }));

      expect(
        await resolver.addInstrument({
          instrument_ticker: "TEST",
          instrument_name: "test",
        })
      ).toEqual({ instrument_ticker: "TEST", instrument_name: "test" });
    });
  });
});
