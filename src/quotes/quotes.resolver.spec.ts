import { Test, TestingModule } from "@nestjs/testing";
import { QuoteMutation } from "./models/quote-mutation.dto";
import { Quote } from "./models/quote-query.dto";
import { QuotesResolver } from "./quotes.resolver";
import { QuotesService } from "./quotes.service";

describe("QuotesResolver", () => {
  let resolver: QuotesResolver;
  let service: QuotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotesResolver, QuotesService],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
    resolver = module.get<QuotesResolver>(QuotesResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  describe("getQuotes", () => {
    it("should return an array of quotes", async () => {
      const result: Quote[] = [
        {
          id: 0,
          instrument: "TEST",
          timestamp: new Date(100),
          price: 200,
        },
      ];
      jest.spyOn(service, "getAll").mockImplementation(() => result);

      expect(await resolver.getQuotes()).toBe(result);
    });
  });

  describe("getQuote", () => {
    it("should return a qoute", async () => {
      const result: Quote = {
        id: 4,
        instrument: "TEST",
        timestamp: new Date(100),
        price: 200,
      };
      jest.spyOn(service, "getOne").mockImplementation((input) => ({
        id: input.id,
        instrument: result.instrument,
        timestamp: result.timestamp,
        price: result.price,
      }));

      expect(
        await resolver.getQuote({
          id: result.id,
        })
      ).toEqual(result);
    });
  });

  describe("addQuote", () => {
    it("should make a new quote", async () => {
      let quote: QuoteMutation = {
        instrument: "TEST",
        timestamp: new Date(100),
        price: 200,
      };

      jest.spyOn(service, "addNew").mockImplementation((arg) => ({
        id: 10,
        ...arg,
      }));

      expect(await resolver.addQuote(quote)).toEqual({ id: 10, ...quote });
    });
  });
});
