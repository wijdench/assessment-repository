import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { QraphQLResolver } from './graphql.resolver';
import { XmlParserModule } from '../xml-parser/xml-parser.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      path: '/graphql',
    }),
    XmlParserModule,
    DatabaseModule,
  ],
  providers: [QraphQLResolver],
})
export class GraphqlModule {}
