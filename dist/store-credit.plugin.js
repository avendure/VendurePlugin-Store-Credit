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
var StoreCreditPlugin_1;
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
const npp_service_1 = require("./service/npp.service");
const npp_resolver_1 = require("./resolvers/npp.resolver");
const deepmerge_1 = __importDefault(require("deepmerge"));
const constants_1 = require("./constants");
const credit_exchange_service_1 = require("./service/credit-exchange.service");
const exchange_request_entity_1 = require("./entity/exchange-request.entity");
const credit_exchange_resolver_1 = require("./resolvers/credit-exchange.resolver");
let StoreCreditPlugin = exports.StoreCreditPlugin = StoreCreditPlugin_1 = class StoreCreditPlugin {
    static init(options) {
        this.options = (0, deepmerge_1.default)(this.options, options);
        return StoreCreditPlugin_1;
    }
};
StoreCreditPlugin.options = {
    // npp: {
    //     name: 'Root NPP Product',
    //     slug: 'root-non-purchasable-product',
    // },
    creditToCurrencyFactor: { default: 1 },
    platformFee: { type: 'fixed', value: 1 },
    exchange: {
        fee: { type: 'fixed', value: 0 },
        maxAmount: 999,
        payoutOption: { name: 'Payout', code: 'payout' },
    },
};
StoreCreditPlugin.uiExtensions = {
    id: 'store-credit',
    extensionPath: path_1.default.join(__dirname, 'ui'),
    routes: [{ route: 'store-credit', filePath: 'routes.ts' }],
    providers: ['providers.ts'],
};
exports.StoreCreditPlugin = StoreCreditPlugin = StoreCreditPlugin_1 = __decorate([
    (0, core_1.VendurePlugin)({
        imports: [core_1.PluginCommonModule],
        entities: [store_credit_entity_1.StoreCredit, exchange_request_entity_1.CreditExchange],
        shopApiExtensions: {
            schema: api_extension_1.shopApiExtensions,
            resolvers: [
                store_credit_shop_resolver_1.ShopStoreCreditResolver,
                npp_resolver_1.NppShopResolver,
                store_credit_shop_resolver_1.SellerEntityShopResolver,
                store_credit_shop_resolver_1.CustomerEntityShopResolver,
            ],
        },
        adminApiExtensions: {
            schema: api_extension_1.adminApiExtensions,
            resolvers: [
                store_credit_admin_resolver_1.AdminStoreCreditResolver,
                npp_resolver_1.NppAdminResolver,
                credit_exchange_resolver_1.AdminCreditExchangeResolver,
                store_credit_admin_resolver_1.SellerEntityAdminResolver,
                store_credit_admin_resolver_1.CustomerEntityAdminResolver
            ],
        },
        configuration: config => {
            config.paymentOptions.paymentMethodHandlers.push(store_credit_payment_handler_1.StoreCreditPaymentHandler);
            config.customFields.User.push({
                name: 'customerAccountBalance',
                type: 'int',
                defaultValue: 0,
                readonly: true,
                label: [
                    {
                        languageCode: core_1.LanguageCode.en,
                        value: 'Customer Account Balance',
                    },
                ],
            }, {
                name: 'sellerAccountBalance',
                type: 'int',
                defaultValue: 0,
                readonly: true,
                label: [
                    {
                        languageCode: core_1.LanguageCode.en,
                        value: 'Seller Account Balance',
                    },
                ],
            });
            config.customFields.GlobalSettings.push({
                name: 'RootNonPhysicalProduct',
                type: 'relation',
                entity: core_1.Product,
                description: [
                    {
                        languageCode: core_1.LanguageCode.en,
                        value: 'The root product that holds all other Non Physical Products',
                    },
                ],
                label: [
                    {
                        languageCode: core_1.LanguageCode.en,
                        value: 'Root Non Physical Product',
                    },
                ],
                eager: true,
            });
            return config;
        },
        providers: [
            store_credit_service_1.StoreCreditService,
            npp_service_1.NPPService,
            credit_exchange_service_1.CreditExchangeService,
            {
                provide: constants_1.STORE_CREDIT_PLUGIN_OPTIONS,
                useFactory: () => StoreCreditPlugin_1.options,
            },
        ],
        compatibility: '>0.0.0',
    })
], StoreCreditPlugin);
