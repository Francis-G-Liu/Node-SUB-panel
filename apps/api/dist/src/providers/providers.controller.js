"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersController = void 0;
const common_1 = require("@nestjs/common");
const providers_service_1 = require("./providers.service");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_provider_dto_1 = require("./dto/create-provider.dto");
const update_provider_dto_1 = require("./dto/update-provider.dto");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let ProvidersController = class ProvidersController {
    providersService;
    constructor(providersService) {
        this.providersService = providersService;
    }
    async list() {
        const providers = await this.providersService.list();
        return providers.map((p) => ({
            id: p.id,
            name: p.name,
            url: p.subscriptionUrl,
            region: p.regionHint,
            interval: p.syncIntervalMinutes,
            lastSync: p.lastSyncAt,
            tags: p.tags,
        }));
    }
    async findOne(id) {
        const p = await this.providersService.getById(id);
        if (!p)
            return null;
        return {
            id: p.id,
            name: p.name,
            url: p.subscriptionUrl,
            region: p.regionHint,
            interval: p.syncIntervalMinutes,
            lastSync: p.lastSyncAt,
            tags: p.tags,
        };
    }
    create(user, dto) {
        return this.providersService.create(dto, user.id);
    }
    update(user, id, dto) {
        return this.providersService.update(id, dto, user.id);
    }
    delete(user, id) {
        return this.providersService.delete(id, user.id);
    }
    sync(user, id) {
        return this.providersService.sync(id, user.id);
    }
};
exports.ProvidersController = ProvidersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_provider_dto_1.CreateProviderDto]),
    __metadata("design:returntype", void 0)
], ProvidersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_provider_dto_1.UpdateProviderDto]),
    __metadata("design:returntype", void 0)
], ProvidersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProvidersController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProvidersController.prototype, "sync", null);
exports.ProvidersController = ProvidersController = __decorate([
    (0, common_1.Controller)('providers'),
    (0, roles_decorator_1.Roles)('super_admin', 'ops'),
    __metadata("design:paramtypes", [providers_service_1.ProvidersService])
], ProvidersController);
//# sourceMappingURL=providers.controller.js.map