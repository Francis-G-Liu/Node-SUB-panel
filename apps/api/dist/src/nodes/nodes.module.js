"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodesModule = void 0;
const common_1 = require("@nestjs/common");
const nodes_service_1 = require("./nodes.service");
const nodes_admin_controller_1 = require("./nodes-admin.controller");
const nodes_app_controller_1 = require("./nodes-app.controller");
const database_module_1 = require("../database/database.module");
const observability_module_1 = require("../observability/observability.module");
const health_check_service_1 = require("./health-check.service");
let NodesModule = class NodesModule {
};
exports.NodesModule = NodesModule;
exports.NodesModule = NodesModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, observability_module_1.ObservabilityModule],
        controllers: [nodes_admin_controller_1.NodesAdminController, nodes_app_controller_1.NodesAppController],
        providers: [nodes_service_1.NodesService, health_check_service_1.HealthCheckService],
        exports: [nodes_service_1.NodesService],
    })
], NodesModule);
//# sourceMappingURL=nodes.module.js.map