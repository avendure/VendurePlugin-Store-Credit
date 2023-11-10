"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedExtensionsModule = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const store_credit_ui_extension_module_1 = require("./extensions/14e4c3a64aa05d67bdf089b8b654f05ff266fdfb1f50781e5ac3ee8d5ae837c7/store-credit-ui-extension.module");
let SharedExtensionsModule = class SharedExtensionsModule {
};
SharedExtensionsModule = __decorate([
    (0, core_1.NgModule)({
        imports: [common_1.CommonModule, store_credit_ui_extension_module_1.StoreCreditExtensionModule],
        providers: [],
    })
], SharedExtensionsModule);
exports.SharedExtensionsModule = SharedExtensionsModule;
