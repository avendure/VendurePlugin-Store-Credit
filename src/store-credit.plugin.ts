import { Customer, LanguageCode, PluginCommonModule, Product, VendurePlugin } from '@vendure/core';
import { StoreCredit } from './entity/store-credit.entity';
import { adminApiExtensions, shopApiExtensions } from './api.extension';
import { CustomerEntityShopResolver, SellerEntityShopResolver, ShopStoreCreditResolver } from './resolvers/store-credit-shop.resolver';
import { AdminStoreCreditResolver, CustomerEntityAdminResolver, SellerEntityAdminResolver } from './resolvers/store-credit-admin.resolver';
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
    interface CustomUserFields {
        customerAccountBalance: number;
        sellerAccountBalance: number;
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
        resolvers: [
            ShopStoreCreditResolver, 
            NppShopResolver,
            SellerEntityShopResolver,
            CustomerEntityShopResolver,
        ],
    },
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [
            AdminStoreCreditResolver, 
            NppAdminResolver, 
            AdminCreditExchangeResolver,
            SellerEntityAdminResolver,
            CustomerEntityAdminResolver
        ],
    },
    configuration: config => {
        config.paymentOptions.paymentMethodHandlers.push(StoreCreditPaymentHandler);
        config.customFields.User.push({
            name: 'customerAccountBalance',
            type: 'int',
            defaultValue: 0,
            readonly: true,
            label: [
                {
                    languageCode: LanguageCode.en,
                    value: 'Customer Account Balance',
                },
            ],
        },{
            name: 'sellerAccountBalance',
            type: 'int',
            defaultValue: 0,
            readonly: true,
            label: [
                {
                    languageCode: LanguageCode.en,
                    value: 'Seller Account Balance',
                },
            ],
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
        {
            provide: STORE_CREDIT_PLUGIN_OPTIONS,
            useFactory: () => StoreCreditPlugin.options,
        },
    ],
    compatibility: '>0.0.0',
})
export class StoreCreditPlugin {
    private static options: StoreCreditPluginOptions = {
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

    static init(options: Partial<StoreCreditPluginOptions>) {
        this.options = deepmerge(this.options, options);
        return StoreCreditPlugin;
    }

    static uiExtensions: AdminUiExtension = {
        id: 'store-credit',
        extensionPath: path.join(__dirname, 'ui'),
        routes: [{ route: 'store-credit', filePath: 'routes.ts' }],
        providers: ['providers.ts'],
    };
}
