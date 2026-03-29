"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProviderDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_provider_dto_1 = require("./create-provider.dto");
class UpdateProviderDto extends (0, mapped_types_1.PartialType)(create_provider_dto_1.CreateProviderDto) {
}
exports.UpdateProviderDto = UpdateProviderDto;
//# sourceMappingURL=update-provider.dto.js.map