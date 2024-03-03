import { Product } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { StoreCreditPluginOptions } from './types/options';
declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomUserFields {
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }
    interface CustomGlobalSettingsFields {
        RootNonPhysicalProduct: Product | null;
    }
}
export declare class StoreCreditPlugin {
    private static options;
    static init(options: Partial<StoreCreditPluginOptions>): typeof StoreCreditPlugin;
    static uiExtensions: AdminUiExtension;
}
