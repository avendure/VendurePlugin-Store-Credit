"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const core_2 = require("@vendure/admin-ui/core");
const app_routes_1 = require("./app.routes");
const shared_extensions_module_1 = require("./shared-extensions.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, core_1.NgModule)({
        declarations: [],
        imports: [
            core_2.AppComponentModule,
            router_1.RouterModule.forRoot(app_routes_1.routes, { useHash: false }),
            core_2.CoreModule,
            shared_extensions_module_1.SharedExtensionsModule,
        ],
        bootstrap: [core_2.AppComponent],
    })
], AppModule);
exports.AppModule = AppModule;
