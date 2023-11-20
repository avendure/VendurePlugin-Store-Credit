import { User } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomCustomerFields {
        accountBalance: number;
    }
    interface CustomSellerFields {
        accountBalance: number;
        user?: User;
    }
}
export declare class StoreCreditPlugin {
    static uiExtensions: AdminUiExtension;
}
