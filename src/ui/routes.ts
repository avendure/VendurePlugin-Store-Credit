import { registerRouteComponent } from '@vendure/admin-ui/core';
import { GetStoreCreditDocument } from './generated-types';
import { AllStoreCreditListComponent } from './components/all-store-credit-list/all-store-credit-list.component';
import { StoreCreditDetailComponent } from './components/store-credit-detail/store-credit-detail.component';
import { CreditExchangesListComponent } from './components/credit-exchange-list/credit-exchange-list.component';

export default [
    registerRouteComponent({
        path: 'credits',
        component: AllStoreCreditListComponent,
        breadcrumb: 'Store Credits',
    }),
    registerRouteComponent({
        path: 'credits/:id',
        component: StoreCreditDetailComponent,
        query: GetStoreCreditDocument,
        entityKey: 'storeCredit',
        getBreadcrumbs: entity => {
            return [
                {
                    label: 'Store Credits',
                    link: ['/extensions', 'store-credits', 'credits'],
                },
                {
                    label: entity?.variant?.name || 'Create',
                    link: [],
                },
            ];
        },
    }),
    registerRouteComponent({
        path: 'exchanges',
        component: CreditExchangesListComponent,
        breadcrumb: 'Credit Exchanges',
    }),
];
