"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityModule = void 0;
const common_1 = require("@nestjs/common");
const telemetry_service_1 = require("./telemetry.service");
const telemetry_controller_1 = require("./telemetry.controller");
const stream_controller_1 = require("./stream.controller");
const notification_client_1 = require("./notification-client");
const audit_logs_controller_1 = require("./audit-logs.controller");
const database_module_1 = require("../database/database.module");
let ObservabilityModule = class ObservabilityModule {
};
exports.ObservabilityModule = ObservabilityModule;
exports.ObservabilityModule = ObservabilityModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        providers: [telemetry_service_1.TelemetryService, notification_client_1.NotificationClient],
        controllers: [
            stream_controller_1.StreamController,
            audit_logs_controller_1.AuditLogsController,
            telemetry_controller_1.TelemetryIngestController,
        ],
        exports: [telemetry_service_1.TelemetryService],
    })
], ObservabilityModule);
//# sourceMappingURL=observability.module.js.map