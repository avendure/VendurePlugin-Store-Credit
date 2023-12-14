import { Customer, LanguageCode, PluginCommonModule, Product, VendurePlugin } from '@vendure/core';
import { StoreCredit } from './entity/store-credit.entity';
import { adminApiExtensions, shopApiExtensions } from './api.extension';
import { ShopStoreCreditResolver } from './resolvers/store-credit-shop.resolver';
import { AdminStoreCreditResolver } from './resolvers/store-credit-admin.resolver';
import { StoreCreditService } from './service/store-credit.service';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import path from 'path';
import { StoreCreditPaymentHandler } from './handler/store-credit-payment.handler';
import { NPPService } from './service/npp.service';
import { NppAdminResolver, NppShopResolver } from './resolvers/npp.resolver';
import { StoreCreditPluginOptions } from './types/options';
import deepmerge from 'deepmerge';
import { STORE_CREDIT_PLUGIN_OPTIONS } from './constants';
import { CreditExchangeService } from './service/credit-exchange.service';
import { CreditExchange } from './entity/exchange-request.entity';
import { AdminCreditExchangeResolver } from './resolvers/credit-exchange.resolver';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomCustomerFields {
        accountBalance: number;
    }

    interface CustomSellerFields {
        accountBalance: number;
        customer?: Customer | null;
    }

    interface CustomGlobalSettingsFields {
        RootNonPhysicalProduct: Product | null;
    }
}

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [StoreCredit, CreditExchange],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [ShopStoreCreditResolver, NppShopResolver],
    },
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [AdminStoreCreditResolver, NppAdminResolver, AdminCreditExchangeResolver],
    },
    configuration: config => {
        config.paymentOptions.paymentMethodHandlers.push(StoreCreditPaymentHandler);
        config.customFields.Seller.push({
            name: 'accountBalance',
            type: 'int',
            defaultValue: 0,
            readonly: true,
            label: [
                {
                    languageCode: LanguageCode.en,
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
                    languageCode: LanguageCode.en,
                    value: 'Account Balance',
                },
            ],
        });
        config.customFields.Seller.push({
            name: 'customer',
            type: 'relation',
            entity: Customer,
            nullable: true,
        });
        config.customFields.GlobalSettings.push({
            name: 'RootNonPhysicalProduct',
            type: 'relation',
            entity: Product,
            description: [
                {
                    languageCode: LanguageCode.en,
                    value: 'The root product that holds all other Non Physical Products',
                },
            ],
            label: [
                {
                    languageCode: LanguageCode.en,
                    value: 'Root Non Physical Product',
                },
            ],
            eager: true,
        });
        return config;
    },
    providers: [
        StoreCreditService,
        NPPService,
        CreditExchangeService,
        { provide: STORE_CREDIT_PLUGIN_OPTIONS, useFactory: () => StoreCreditPlugin.options },
    ],
    compatibility: '>0.0.0',
})
export class StoreCreditPlugin {
    private static options: StoreCreditPluginOptions = {
        npp: {
            name: 'Root NPP Product',
            slug: 'root-non-purchasable-product',
        },
        creditToCurrencyFactor: { default: 1 },
        platformFee: { type: 'fixed', value: 1 },
        exchangeFee: { type: 'fixed', value: 0 }
    };

    static init(options: Partial<StoreCreditPluginOptions>) {
        this.options = deepmerge(this.options, options);
        return StoreCreditPlugin;
    }

    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
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
}
