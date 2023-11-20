import { OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TypedBaseListComponent, NotificationService, ModalService } from '@vendure/admin-ui/core';
import { GetAllStoreCreditsDocument } from '../../generated-types';
export declare class AllStoreCreditListComponent extends TypedBaseListComponent<typeof GetAllStoreCreditsDocument, 'storeCredits'> implements OnInit {
    private modalService;
    private notificationService;
    searchTerm: FormControl<string | null>;
    Quotes: any;
    readonly filters: import("@vendure/admin-ui/core").DataTableFilterCollection<import("../../generated-types").StoreCreditFilterParameter>;
    readonly sorts: import("@vendure/admin-ui/core").DataTableSortCollection<import("../../generated-types").StoreCreditSortParameter, ["createdAt", "updatedAt", "key", "value", "customerId"]>;
    constructor(modalService: ModalService, notificationService: NotificationService);
    getCustomerUrl(customerId: string): string;
    deleteStoreCredit(id: string): void;
}
