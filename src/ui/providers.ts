import {
    addNavMenuSection,
    registerCustomDetailComponent,
    registerFormInputComponent,
    registerBulkAction,
} from "@vendure/admin-ui/core";
import { CreditsInSellerComponent } from "./components/CreditsInSeller/creditsInSeller";
import { UpdateCreditExchangeStatus } from "./components/credit-exchange-list/credit-exchange-bulk-actions";
import { RequestExchange } from "./components/request-exchange/request-exchange.component";
import { SellerCustomerFormInputComponent } from "./components/seller-customer/seller-customer.component";

export default [
    addNavMenuSection(
        {
            id: "store-credit-nav",
            label: "Store Credit",
            items: [
                {
                    id: "store-credit",
                    label: "Store Credit",
                    routerLink: ["/extensions/store-credit/credits"],
                    icon: "folder-open",
                },
                {
                    id: "credit-exchanges",
                    label: "Exchanges",
                    routerLink: ["/extensions/store-credit/exchanges"],
                    icon: "folder-open",
                },
            ],
            requiresPermission: "SuperAdmin",
        },
        // Add this section before the "settings" section
        "settings"
    ),
    registerCustomDetailComponent({
        locationId: "seller-detail",
        component: CreditsInSellerComponent,
    }),
    registerCustomDetailComponent({
        locationId: "seller-detail",
        component: RequestExchange,
    }),
    registerBulkAction(UpdateCreditExchangeStatus),
    registerFormInputComponent(
        "seller-customer-input",
        SellerCustomerFormInputComponent
    ),
];
