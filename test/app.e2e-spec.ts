import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { InstrumentsModule } from "../src/instruments/instruments.module";
import { QuotesModule } from "../src/quotes/quotes.module";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { Quote } from "../src/quotes/models/quote.entity";
import { Instrument } from "../src/instruments/models/instrument.entity";
import { InstrumentsResolver } from "../src/instruments/instruments.resolver";
import { QuotesResolver } from "../src/quotes/quotes.resolver";
import { QuotesService } from "../src/quotes/quotes.service";
import { getConnection } from "typeorm";
import { QuoteInput } from "../src/quotes/models/quote-input.dto";
import { InstrumentsService } from "../src/instruments/instruments.service";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let instrumentsResolver: InstrumentsResolver;
  let quotesResolver: QuotesResolver;
  let quotesService: QuotesService;
  let instrumentsService: InstrumentsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        InstrumentsModule,
        QuotesModule,
        GraphQLModule.forRoot({
          autoSchemaFile: join(process.cwd(), "../src/schema.gql"),
          buildSchemaOptions: { dateScalarMode: "timestamp" },
        }),
        TypeOrmModule.forRoot({
          type: "postgres",
          host: "localhost",
          port: 5430,
          username: "test-user",
          password: "test-password",
          database: "stock-quotes-tests",
          entities: [Quote, Instrument], //I couldn't get the path style entities (like in the ormconfig file) to work
          synchronize: true,
          dropSchema: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    instrumentsResolver =
      moduleFixture.get<InstrumentsResolver>(InstrumentsResolver);

    quotesResolver = moduleFixture.get<QuotesResolver>(QuotesResolver);
    quotesService = moduleFixture.get<QuotesService>(QuotesService);
    instrumentsService =
      moduleFixture.get<InstrumentsService>(InstrumentsService);
  });

  afterAll(async () => {
    await app.close();
  });

  const sleep = jest.fn((ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });

  // My original test attempt - not sure if it my or jests fault, but it would throw Error: connect ECONNREFUSED
  // when I attempted to send to concurent requests, so I switched to working directly with the resolver

  // it("should only create one instrument", async () => {
  //   debugger;

  //   const writeQuery = (ticker, name) => {
  //     return `mutation {
  //         addInstrument(
  //           newInstrument: {
  //             instrumentTicker: "${ticker}"
  //             instrumentName: "${name}"
  //           }
  //         ) {
  //           instrumentTicker
  //           instrumentName
  //         }
  //       }`;
  //   };

  //   let request1 = await request(app.getHttpServer())
  //     .post("/graphql")
  //     .send({
  //       query: writeQuery("TEST6", "test 1"),
  //     });

  //   let request2 = request(app.getHttpServer())
  //     .post("/graphql")
  //     .send({
  //       query: writeQuery("TEST6", "test 2"),
  //     });

  //   let response1 = await request1;
  //   let response2 = await request2;

  //   console.log(response1.body);
  //   console.log(response2.body);

  //   expect(response1.body.data.addInstrument).toEqual({
  //     instrumentTicker: "TEST6",
  //     instrumentName: "test 1",
  //   });
  //   expect(response1.body.errors).toBeUndefined();

  //   expect(response2.body.data).toBeNull();
  //   expect(response2.body.errors).toBeDefined();
  // });

  //Sends 2 concurent requests to create a new instrument with the same ticker
  //One should succseed, one should fail.

  it("should only create one instrument", async () => {
    const ticker = "TEST";

    let request1 = instrumentsResolver.addInstrument({
      instrumentTicker: ticker,
      instrumentName: "test 1",
    });

    let request2 = instrumentsResolver.addInstrument({
      instrumentTicker: ticker,
      instrumentName: "test 2",
    });

    try {
      await expect(request1).resolves.toEqual({
        instrumentTicker: ticker,
        instrumentName: "test 1",
      });

      await expect(request2).rejects.toThrowError(BadRequestException);
      await expect(request2).rejects.toThrowError(
        `Instrument with ticker "${ticker}" already exists`
      );
    } catch (e) {
      await expect(request2).resolves.toEqual({
        instrumentTicker: ticker,
        instrumentName: "test 2",
      });

      await expect(request1).rejects.toThrowError(BadRequestException);
      await expect(request1).rejects.toThrowError(
        `Instrument with ticker "${ticker}" already exists`
      );
    }

    let inst = await instrumentsResolver.getInstrument(ticker);
    await expect(inst).toMatchObject({
      instrumentTicker: ticker,
    });
    await expect(inst).toHaveProperty("instrumentName");
    await expect(["test 1", "test 2"]).toContain(inst.instrumentName);
  });

  //Sends two concurent requests to add a quote for a new ticker
  //Only one instrument should be created, and it should accept both quotes

  it("should only create one instrument for both quotes", async () => {
    debugger;

    const ticker = "QUOTE TEST";

    let requests = await Promise.all([
      quotesResolver.addQuote({
        timestamp: new Date(100),
        price: 100,
        instrument: {
          instrumentTicker: ticker,
          instrumentName: "test 1",
        },
      }),
      quotesResolver.addQuote({
        timestamp: new Date(200),
        price: 200,
        instrument: {
          instrumentTicker: ticker,
          instrumentName: "test 2",
        },
      }),
    ]);

    let request1 = requests[0];
    let request2 = requests[1];

    await expect(request1).toMatchObject({
      price: 100,
      timestamp: new Date(100),
    });
    await expect(request1).toHaveProperty("id");

    await expect(request2).toMatchObject({
      price: 200,
      timestamp: new Date(200),
    });
    await expect(request2).toHaveProperty("id");

    let inst = await instrumentsResolver.getInstrument(ticker);
    await expect(inst).toMatchObject({
      instrumentTicker: ticker,
    });
    await expect(inst).toHaveProperty("instrumentName");
    await expect(["test 1", "test 2"]).toContain(inst.instrumentName);
    await expect(inst.quotes).resolves.toHaveLength(2);
  });

  /*
  I'm not sure if this was the intended solution, but it's the best I can come up with.
  Nestjs is single threaded, which as far as I'm aware makes sending 
  multiple queries simultaniously impossible. The best we can do is send them one after another,
  but as you already stated, that does not guarantee concurrency and induces non-determinism.

  This is instead designed to simulate two instances of the instrumentService.addNew
  method running concurrently. I couldn't find a way in jest to simulate this while using the
  actual function, so I split it into its three queries, and simulated those.

  */

  it("should only create one instrument for both quotes 2", async () => {
    debugger;
    const ticker = "QUOTE TEST 2";

    let quote1: QuoteInput = {
      timestamp: new Date(100),
      price: 100,
      instrument: {
        instrumentTicker: ticker,
        instrumentName: "test 1",
      },
    };

    let quote2: QuoteInput = {
      timestamp: new Date(200),
      price: 200,
      instrument: {
        instrumentTicker: ticker,
        instrumentName: "test 2",
      },
    };

    let insert2Finished = false;

    let runner1 = await getConnection().createQueryRunner();
    let runner2 = await getConnection().createQueryRunner();

    await runner1.startTransaction("READ COMMITTED");
    await runner2.startTransaction("READ COMMITTED");

    //if we await, we technially aren't sending the insert queries concurrently
    //but I don't belive there is any way in nestjs to guarantee their concurrency,
    //so if we don't await, we'll loose determinism
    await instrumentsService.insertIfNotExist(
      quote1.instrument,
      runner1.manager
    );

    //this should not be able to complete until runner1 transaction ends
    let res2 = instrumentsService
      .insertIfNotExist(quote2.instrument, runner2.manager)
      .then(() => {
        insert2Finished = true;
      })
      .then(() =>
        instrumentsService.findOneOrFail(
          quote2.instrument.instrumentTicker,
          runner2.manager
        )
      )
      .then((instrument2) =>
        quotesService.saveQuote(
          { ...quote2, instrument: instrument2 },
          runner2.manager
        )
      );

    await sleep(500);
    expect(insert2Finished).toBe(false);

    let instrument1 = await instrumentsService.findOneOrFail(
      quote1.instrument.instrumentTicker,
      runner1.manager
    );

    await sleep(500);
    expect(insert2Finished).toBe(false);

    let result1 = await quotesService.saveQuote(
      { ...quote1, instrument: instrument1 },
      runner1.manager
    );

    await sleep(500);
    expect(insert2Finished).toBe(false);

    await Promise.all([
      runner1.commitTransaction(),
      runner2.commitTransaction(),
    ]);

    await sleep(10);
    expect(insert2Finished).toBe(true);

    let result2 = await res2;

    expect(result1).toMatchObject({
      price: 100,
      timestamp: new Date(100),
    });
    expect(result1).toHaveProperty("id");

    expect(result2).toMatchObject({
      price: 200,
      timestamp: new Date(200),
    });
    expect(result1).toHaveProperty("id");

    let instrument = await instrumentsResolver.getInstrument(ticker);
    await expect(instrument).toMatchObject({
      instrumentTicker: ticker,
      instrumentName: "test 1",
    });
    await expect(instrument.quotes).resolves.toHaveLength(2);

    await expect(instrument.quotes).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: result1.id,
          timestamp: result1.timestamp,
          price: result1.price,
        }),
        expect.objectContaining({
          id: result2.id,
          timestamp: result2.timestamp,
          price: result2.price,
        }),
      ])
    );
  });
});
