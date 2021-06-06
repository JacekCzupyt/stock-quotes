import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { InstrumentsModule } from "./instruments/instruments.module";
import { QuotesModule } from "./quotes/quotes.module";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    InstrumentsModule,
    QuotesModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      buildSchemaOptions: { dateScalarMode: "timestamp" },
    }),
    TypeOrmModule.forRoot(),
  ],
})
export class AppModule {}
