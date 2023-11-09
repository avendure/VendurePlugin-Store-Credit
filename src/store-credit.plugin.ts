import {
  LanguageCode,
  PluginCommonModule,
  User,
  VendurePlugin,
} from '@vendure/core';
import { StoreCredit } from './entity/store-credit.entity';
import { adminApiExtensions, shopApiExtensions } from './api.extension';
import { ShopStoreCreditResolver } from './resolvers/store-credit-shop.resolver';
import { AdminStoreCreditResolver } from './resolvers/store-credit-admin.resolver';
import { StoreCreditService } from './service/store-credit.service';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import path from 'path';
import { StoreCreditPaymentHandler } from './handler/store-credit-payment.handler';
import { StoreCreditCommResolver } from './resolvers/store-credit-comm.resolver';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
  interface CustomCustomerFields {
    accountBalance: number;
  }

  interface CustomSellerFields {
    accountBalance: number;
    user?: User;
  }
}

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [StoreCredit],
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [ShopStoreCreditResolver, StoreCreditCommResolver],
  },
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [AdminStoreCreditResolver, StoreCreditCommResolver],
  },
  configuration: (config) => {
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
      name: 'user',
      type: 'relation',
      entity: User,
      nullable: true,
    });
    return config;
  },
  providers: [StoreCreditService],
  compatibility: '>0.0.0',
})
export class StoreCreditPlugin {
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
