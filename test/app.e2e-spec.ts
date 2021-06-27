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

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let instrumentsResolver: InstrumentsResolver;
  let quotesResolver: QuotesResolver;

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
          port: 5431,
          username: "test-user",
          password: "test-password",
          database: "stock-quotes",
          entities: [Quote, Instrument],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    instrumentsResolver =
      moduleFixture.get<InstrumentsResolver>(InstrumentsResolver);

    quotesResolver = moduleFixture.get<QuotesResolver>(QuotesResolver);
  });

  afterAll(async () => {
    await app.close();
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

    await expect(request1).resolves.toEqual({
      instrumentTicker: ticker,
      instrumentName: "test 1",
    });

    await expect(request2).rejects.toThrowError(BadRequestException);
    await expect(request2).rejects.toThrowError(
      `Instrument with ticker "${ticker}" already exists`
    );
  });

  //Sends two concurent requests to add a quote for a new ticker
  //Only one instrument should be created, and it should accept both quotes

  it("should only create one instrument for both quotes", async () => {
    const ticker = "QUOTE TEST";

    let request1 = quotesResolver.addQuote({
      timestamp: new Date(100),
      price: 100,
      instrument: {
        instrumentTicker: ticker,
        instrumentName: "test 1",
      },
    });

    let request2 = quotesResolver.addQuote({
      timestamp: new Date(200),
      price: 200,
      instrument: {
        instrumentTicker: ticker,
        instrumentName: "test 2",
      },
    });

    await expect(request1).resolves.toMatchObject({
      price: 100,
      timestamp: new Date(100),
    });
    await expect(request1).resolves.toHaveProperty("id");

    await expect(request2).resolves.toMatchObject({
      price: 200,
      timestamp: new Date(200),
    });
    await expect(request2).resolves.toHaveProperty("id");

    await request1;
    await request2;

    let inst = await instrumentsResolver.getInstrument(ticker);
    await expect(inst).toMatchObject({
      instrumentTicker: ticker,
    });
    await expect(inst).toHaveProperty("instrumentName");
    await expect(["test 1", "test 2"]).toContain(inst.instrumentName);
    await expect(inst.quotes).resolves.toHaveLength(2);
  });
});
