import { NgModule, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule, DataService } from '@vendure/admin-ui/core';
import { AllStoreCreditListComponent } from './components/all-store-credit-list/all-store-credit-list.component';
import { StoreCreditDetailComponent } from './components/store-credit-detail/store-credit-detail.component';

import {
  StoreCreditsFragment,
  GetStoreCreditQuery,
  GetStoreCreditQueryVariables
} from './generated-types';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GET_STORE_CREDIT } from './components/all-store-credit-list/all-store-credit-list.graphql';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: AllStoreCreditListComponent,
        data: { breadcrumb: 'Store Credits' }
      },
      {
        path: 'create',
        component: StoreCreditDetailComponent,
        data: {
          breadcrumb: [
            {
              label: 'Store Credits',
              link: ['/extensions', 'store-credit'],
              requiresPermission: 'SuperAdmin'
            },
            {
              label: 'Create Store Credit',
              link: [],
              requiresPermission: 'SuperAdmin'
            }
          ]
        }
      },
      {
        path: ':id',
        component: StoreCreditDetailComponent,
        resolve: {
          detail: (route: any) => {
            return inject(DataService)
              .mutate<GetStoreCreditQuery, GetStoreCreditQueryVariables>(
                GET_STORE_CREDIT,
                { id: route.paramMap.get('id') }
              )
              .pipe(map((data) => ({ entity: of(data.storeCredit) })));
          }
        },
        data: { breadcrumb: storeCreditDetailBreadcrumb }
      }
    ])
  ],
  declarations: [AllStoreCreditListComponent, StoreCreditDetailComponent]
})
export class StoreCreditUIModule {}

export function storeCreditDetailBreadcrumb(resolved: {
  detail: { entity: Observable<StoreCreditsFragment> };
}) {
  return resolved.detail.entity.pipe(
    map((entity) => [
      {
        label: 'Store Credits',
        link: ['/extensions', 'store-credit'],
        requiresPermission: 'SuperAdmin'
      },
      {
        label: 'Update Store Credit',
        link: [],
        requiresPermission: 'SuperAdmin'
      }
    ])
  );
}
