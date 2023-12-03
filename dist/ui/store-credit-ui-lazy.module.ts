import { NgModule, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule, DataService } from '@vendure/admin-ui/core';
import { AllStoreCreditListComponent } from './components/all-store-credit-list/all-store-credit-list.component';
import { StoreCreditDetailComponent } from './components/store-credit-detail/store-credit-detail.component';

import { GetStoreCreditQuery, GetStoreCreditQueryVariables } from './generated-types';
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
                data: { breadcrumb: 'Store Credits' },
            },
            {
                path: ':id',
                component: StoreCreditDetailComponent,
                resolve: {
                    detail: (route: any) => {
                        return inject(DataService)
                            .query<GetStoreCreditQuery, GetStoreCreditQueryVariables>(GET_STORE_CREDIT, {
                                id: route.paramMap.get('id'),
                            })
                            .mapStream(data => ({
                                entity: of(data.storeCredit),
                            }));
                    },
                },
                data: { breadcrumb: storeCreditDetailBreadcrumb },
            },
        ]),
    ],
    declarations: [AllStoreCreditListComponent, StoreCreditDetailComponent],
})
export class StoreCreditUIModule {}

export function storeCreditDetailBreadcrumb(resolved: {
    detail: { entity: Observable<GetStoreCreditQuery['storeCredit']> };
}) {
    return resolved.detail.entity.pipe(
        map(entity => {
            if (entity == null)
                return [
                    {
                        label: 'Store Credits',
                        link: ['/extensions', 'store-credit'],
                        requiresPermission: 'SuperAdmin',
                    },
                    {
                        label: 'Create',
                        link: [],
                        requiresPermission: 'SuperAdmin',
                    },
                ];
            return [
                {
                    label: 'Store Credits',
                    link: ['/extensions', 'store-credit'],
                    requiresPermission: 'SuperAdmin',
                },
                {
                    label: entity.variant?.name || entity.key,
                    link: [],
                    requiresPermission: 'SuperAdmin',
                },
            ];
        }),
    );
}
