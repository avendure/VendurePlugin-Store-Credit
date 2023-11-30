import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  SharedModule,
  addNavMenuSection,
  registerCustomDetailComponent,
} from '@vendure/admin-ui/core';
import { CreditsInSellerComponent } from './components/CreditsInSeller/creditsInSeller';
import { CurrencyInputComponent } from '@vendure/admin-ui/core/shared/components/currency-input/currency-input.component';

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
            routerLink: ['/extensions/store-credit'],
            icon: 'folder-open',
          },
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [CreditsInSellerComponent],
})
export class StoreCreditExtensionModule {}
