"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCreditPlugin = void 0;
const core_1 = require("@vendure/core");
const store_credit_entity_1 = require("./entity/store-credit.entity");
const api_extension_1 = require("./api.extension");
const store_credit_shop_resolver_1 = require("./resolvers/store-credit-shop.resolver");
const store_credit_admin_resolver_1 = require("./resolvers/store-credit-admin.resolver");
const store_credit_service_1 = require("./service/store-credit.service");
const path_1 = __importDefault(require("path"));
const store_credit_payment_handler_1 = require("./handler/store-credit-payment.handler");
const store_credit_comm_resolver_1 = require("./resolvers/store-credit-comm.resolver");
let StoreCreditPlugin = exports.StoreCreditPlugin = class StoreCreditPlugin {
};
StoreCreditPlugin.uiExtensions = {
    extensionPath: path_1.default.join(__dirname, 'ui'),
    ngModules: [
        {
            type: 'lazy',
            route: 'store-credit',
            ngModuleFileName: 'store-credit-ui-lazy.module.ts',
            ngModuleName: 'StoreCreditUIModule',
        },
        {
            type: 'shared',
            ngModuleFileName: 'store-credit-ui-extension.module.ts',
            ngModuleName: 'StoreCreditExtensionModule',
        },
    ],
};
exports.StoreCreditPlugin = StoreCreditPlugin = __decorate([
    (0, core_1.VendurePlugin)({
        imports: [core_1.PluginCommonModule],
        entities: [store_credit_entity_1.StoreCredit],
        shopApiExtensions: {
            schema: api_extension_1.shopApiExtensions,
            resolvers: [store_credit_shop_resolver_1.ShopStoreCreditResolver, store_credit_comm_resolver_1.StoreCreditCommResolver],
        },
        adminApiExtensions: {
            schema: api_extension_1.adminApiExtensions,
            resolvers: [store_credit_admin_resolver_1.AdminStoreCreditResolver, store_credit_comm_resolver_1.StoreCreditCommResolver],
        },
        configuration: (config) => {
            config.paymentOptions.paymentMethodHandlers.push(store_credit_payment_handler_1.StoreCreditPaymentHandler);
            config.customFields.Seller.push({
                name: 'accountBalance',
                type: 'int',
                defaultValue: 0,
                readonly: true,
                label: [
                    {
                        languageCode: core_1.LanguageCode.en,
                        value: 'Account Balance',
                    },
                ],
            });
            config.customFields.Customer.push({
                name: 'accountBalance',
                type: 'int',
                defaultValue: 0,
                readonly: true,
                label: [
                    {
                        languageCode: core_1.LanguageCode.en,
                        value: 'Account Balance',
                    },
                ],
            });
            config.customFields.Seller.push({
                name: 'user',
                type: 'relation',
                entity: core_1.User,
                nullable: true,
            });
            return config;
        },
        providers: [store_credit_service_1.StoreCreditService],
        compatibility: '>0.0.0',
    })
], StoreCreditPlugin);
