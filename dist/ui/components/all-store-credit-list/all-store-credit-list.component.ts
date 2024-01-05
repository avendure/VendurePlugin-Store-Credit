import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
    TypedBaseListComponent,
    SharedModule,
    NotificationService,
    ModalService,
} from '@vendure/admin-ui/core';

import {
    GetAllStoreCreditsDocument,
    LogicalOperator,
    DeleteStoreCreditMutation,
    DeleteStoreCreditMutationVariables,
} from '../../generated-types';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DELETE_STORE_CREDIT } from './all-store-credit-list.graphql';

@Component({
    imports: [SharedModule],
    standalone: true,
    selector: 'vdr-all-store-credit-list',
    templateUrl: './all-store-credit-list.component.html',
    styleUrls: ['./all-store-credit-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllStoreCreditListComponent
    extends TypedBaseListComponent<typeof GetAllStoreCreditsDocument, 'storeCredits'>
    implements OnInit
{
    readonly filters = this.createFilterCollection()
        .addDateFilters()
        .addIdFilter()
        .addFilter({
            filterField: 'variantId',
            name: 'variantId',
            label: 'Variant Id',
            type: { kind: 'text' },
        })
        .addFilter({
            filterField: 'customerId',
            name: 'customerId',
            label: 'Customer Id',
            type: { kind: 'text' },
        })
        .addFilter({
            filterField: 'perUserLimit',
            name: 'perUserLimit',
            label: 'Per User Limit',
            type: { kind: 'number' },
        })
        .addFilter({
            filterField: 'value',
            name: 'value',
            label: 'Value',
            type: { kind: 'number' },
        })
        .addFilter({
            name: 'claimed',
            label: 'Claimed',
            type: {
                kind: 'boolean',
            },
            toFilterInput: value => {
                return { variantId: { isNull: value }, customerId: { isNull: !value } };
            },
        })
        .addFilter({
            name: 'purchasable',
            label: 'Purchasable',
            type: {
                kind: 'boolean',
            },
            toFilterInput: value => {
                return { variantId: { isNull: !value } };
            },
        })
        .connectToRoute(this.route);

    readonly sorts = this.createSortCollection()
        .defaultSort('createdAt', 'DESC')
        .addSort({ name: 'id' })
        .addSort({ name: 'value' })
        .addSort({ name: 'perUserLimit' })
        .addSort({ name: 'variantId' })
        .addSort({ name: 'createdAt' })
        .addSort({ name: 'updatedAt' })
        .connectToRoute(this.route);

    constructor(
        private modalService: ModalService,
        private notificationService: NotificationService,
    ) {
        super();
        super.configure({
            document: GetAllStoreCreditsDocument,
            getItems: data => data.storeCredits,
            setVariables: (skip, take) => ({
                options: {
                    skip,
                    take,
                    sort: this.sorts.createSortInput(),
                    filter: this.filters.createFilterInput(),
                    filterOperator: LogicalOperator.AND,
                },
            }),
            refreshListOnChanges: [this.filters.valueChanges, this.sorts.valueChanges],
        });
    }

    deleteStoreCredit(id: string) {
        this.modalService
            .dialog({
                title: 'Delete Store Credit?',
                buttons: [
                    { type: 'secondary', label: _('common.cancel') },
                    {
                        type: 'danger',
                        label: _('common.delete'),
                        returnValue: true,
                    },
                ],
            })
            .pipe(
                switchMap(response =>
                    response
                        ? this.dataService.mutate<
                              DeleteStoreCreditMutation,
                              DeleteStoreCreditMutationVariables
                          >(DELETE_STORE_CREDIT, { input: id })
                        : EMPTY,
                ),
            )
            .subscribe({
                next: () => {
                    this.notificationService.success(_('common.notify-delete-success'), {
                        entity: 'StoreCredit',
                    });
                    this.refresh();
                },
                error: () => {
                    this.notificationService.error(_('common.notify-update-error'), {
                        entity: 'StoreCredit',
                    });
                },
            });
    }
}
