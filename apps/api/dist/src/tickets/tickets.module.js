"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsModule = void 0;
const common_1 = require("@nestjs/common");
const tickets_service_1 = require("./tickets.service");
const tickets_admin_controller_1 = require("./tickets-admin.controller");
const tickets_app_controller_1 = require("./tickets-app.controller");
const database_module_1 = require("../database/database.module");
const observability_module_1 = require("../observability/observability.module");
let TicketsModule = class TicketsModule {
};
exports.TicketsModule = TicketsModule;
exports.TicketsModule = TicketsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, observability_module_1.ObservabilityModule],
        providers: [tickets_service_1.TicketsService],
        controllers: [tickets_admin_controller_1.TicketsAdminController, tickets_app_controller_1.TicketsAppController],
        exports: [tickets_service_1.TicketsService],
    })
], TicketsModule);
//# sourceMappingURL=tickets.module.js.map