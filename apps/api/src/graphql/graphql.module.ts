import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CatalogResolver } from './resolvers/catalog.resolver';
import { NodesModule } from '../nodes/nodes.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      path: '/graphql',
      sortSchema: true,
      playground: false,
      context: ({ req }) => ({ req }),
    }),
    NodesModule,
    SubscriptionsModule,
    TicketsModule,
  ],
  providers: [CatalogResolver],
})
export class ApiGraphqlModule {}
