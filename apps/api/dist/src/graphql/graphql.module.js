"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGraphqlModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const catalog_resolver_1 = require("./resolvers/catalog.resolver");
const nodes_module_1 = require("../nodes/nodes.module");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
const tickets_module_1 = require("../tickets/tickets.module");
let ApiGraphqlModule = class ApiGraphqlModule {
};
exports.ApiGraphqlModule = ApiGraphqlModule;
exports.ApiGraphqlModule = ApiGraphqlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'schema.gql'),
                path: '/graphql',
                sortSchema: true,
                playground: false,
                context: ({ req }) => ({ req }),
            }),
            nodes_module_1.NodesModule,
            subscriptions_module_1.SubscriptionsModule,
            tickets_module_1.TicketsModule,
        ],
        providers: [catalog_resolver_1.CatalogResolver],
    })
], ApiGraphqlModule);
//# sourceMappingURL=graphql.module.js.map