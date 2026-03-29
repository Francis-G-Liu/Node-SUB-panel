"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const subscriptions_service_1 = require("./subscriptions.service");
const plans_controller_1 = require("./plans.controller");
const me_controller_1 = require("./me.controller");
const admin_subscriptions_controller_1 = require("./admin-subscriptions.controller");
const admin_users_controller_1 = require("./admin-users.controller");
const admin_categories_controller_1 = require("./admin-categories.controller");
let SubscriptionsModule = class SubscriptionsModule {
};
exports.SubscriptionsModule = SubscriptionsModule;
exports.SubscriptionsModule = SubscriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [
            plans_controller_1.PlansController,
            me_controller_1.MeController,
            admin_subscriptions_controller_1.AdminSubscriptionsController,
            admin_users_controller_1.AdminUsersController,
            admin_categories_controller_1.AdminCategoriesController,
        ],
        providers: [subscriptions_service_1.SubscriptionsService],
        exports: [subscriptions_service_1.SubscriptionsService],
    })
], SubscriptionsModule);
//# sourceMappingURL=subscriptions.module.js.map