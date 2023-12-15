import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  SharedModule,
  addNavMenuSection,
  registerCustomDetailComponent,
  registerBulkAction
} from '@vendure/admin-ui/core';
import { CreditsInSellerComponent } from './components/CreditsInSeller/creditsInSeller';
import { UpdateCreditExchangeStatus } from './components/credit-exchange-list/credit-exchange-bulk-actions';
import { CreditExchangeStatusDialog } from './components/credit-exchange-list/credit-exchange-status-dialog.component';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuSection(
      {
        id: 'store-credit-nav',
        label: 'Store Credit',
        items: [
          {
            id: 'store-credit',
            label: 'Store Credit',
            routerLink: ['/extensions/store-credit/credits'],
            icon: 'folder-open',
          },
          {
              id: 'credit-exchanges',
              label: 'Exchanges',
              routerLink: ['/extensions/store-credit/exchanges'],
              icon: 'folder-open'
          }
        ],
        requiresPermission: 'SuperAdmin',
      },
      // Add this section before the "settings" section
      'settings',
    ),
    registerCustomDetailComponent({
      locationId: 'seller-detail',
      component: CreditsInSellerComponent,
    }),
    registerBulkAction(UpdateCreditExchangeStatus),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [CreditsInSellerComponent, CreditExchangeStatusDialog],
})
export class StoreCreditExtensionModule {}
