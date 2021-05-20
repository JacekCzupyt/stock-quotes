import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { InstrumentsModule } from "./instruments/instruments.module";

@Module({
  imports: [
    InstrumentsModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      buildSchemaOptions: { dateScalarMode: "timestamp" },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
