"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCreditExtensionModule = void 0;
const core_1 = require("@angular/core");
const core_2 = require("@vendure/admin-ui/core");
const creditsInSeller_1 = require("./components/CreditsInSeller/creditsInSeller");
let StoreCreditExtensionModule = class StoreCreditExtensionModule {
};
StoreCreditExtensionModule = __decorate([
    (0, core_1.NgModule)({
        imports: [core_2.SharedModule],
        providers: [
            (0, core_2.addNavMenuSection)({
                id: 'store-credit-nav',
                label: 'Store Credit',
                items: [
                    {
                        id: 'store-credit',
                        label: 'Store Credit',
                        routerLink: ['/extensions/store-credit'],
                        icon: 'folder-open',
                    },
                ],
                requiresPermission: 'SuperAdmin',
            }, 
            // Add this section before the "settings" section
            'settings'),
            (0, core_2.registerCustomDetailComponent)({
                locationId: 'seller-detail',
                component: creditsInSeller_1.CreditsInSellerComponent,
            }),
        ],
        schemas: [core_1.CUSTOM_ELEMENTS_SCHEMA, core_1.NO_ERRORS_SCHEMA],
        declarations: [creditsInSeller_1.CreditsInSellerComponent],
    })
], StoreCreditExtensionModule);
exports.StoreCreditExtensionModule = StoreCreditExtensionModule;
