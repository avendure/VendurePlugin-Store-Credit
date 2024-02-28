import {
    addNavMenuSection,
    registerCustomDetailComponent,
    registerFormInputComponent,
    registerBulkAction,
} from '@vendure/admin-ui/core';
import { UpdateCreditExchangeStatus } from './components/credit-exchange-list/credit-exchange-bulk-actions';
import { RequestExchange } from './components/request-exchange/request-exchange.component';
import { CustomerCreditInfoComponent } from './components/customer-credit-info/customer-credit-info-component';
import { SellerCreditInfoComponent } from './components/seller-credit-info/seller-credit-info-component';

export default [
    addNavMenuSection(
        {
            id: 'store-credit-nav',
            label: 'Store Credit',
            items: [
                {
                    id: 'store-credit',
                    label: 'Store Credit',
                    routerLink: ['/extensions/store-credit/credits'],
                    icon: 'coin-bag',
                },
                {
                    id: 'credit-exchanges',
                    label: 'Exchanges',
                    routerLink: ['/extensions/store-credit/exchanges'],
                    icon: 'credit-card',
                },
            ],
            requiresPermission: 'SuperAdmin',
        },
        // Add this section before the "settings" section
        'settings',
    ),
    registerCustomDetailComponent({
        locationId: 'seller-detail',
        component: RequestExchange,
    }),
    registerCustomDetailComponent({
        locationId: 'customer-detail',
        component: CustomerCreditInfoComponent,
    }),
    registerCustomDetailComponent({
        locationId: 'seller-detail',
        component: SellerCreditInfoComponent,
    }),
    registerBulkAction(UpdateCreditExchangeStatus),
];
