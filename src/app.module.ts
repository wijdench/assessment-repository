import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphqlModule } from './graphql/graphql.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    GraphqlModule, // Import the GraphqlModule which encapsulates GraphQL and service dependencies
  ],
})
export class AppModule {}
