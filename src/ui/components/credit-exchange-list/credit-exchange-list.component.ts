import { ChangeDetectionStrategy, Input, Component, OnInit } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TypedBaseListComponent, NotificationService, SharedModule } from '@vendure/admin-ui/core';

import {
    AcceptCreditExchangeDocument,
    GetAllCreditExchangeDocument,
    RefundCreditExchangeDocument,
    UpdateCreditExchangeStatusDocument,
} from '../../generated-types';

@Component({
    imports: [SharedModule],
    standalone: true,
    selector: 'store-credit-exchanges',
    templateUrl: './credit-exchange-list.component.html',
    styleUrls: ['./credit-exchange-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditExchangesListComponent
    extends TypedBaseListComponent<typeof GetAllCreditExchangeDocument, 'creditExchanges'>
    implements OnInit
{
    @Input() sellerId?: string;

    readonly filters = this.createFilterCollection()
        .addDateFilters()
        .addIdFilter()
        .addFilter({
            filterField: 'amount',
            name: 'amount',
            label: 'Amount',
            type: { kind: 'number' },
        })
        .addFilter({
            filterField: 'status',
            name: 'status',
            label: 'Status',
            type: { kind: 'text' },
        })
        .addFilter({
            filterField: 'sellerId',
            name: 'seller',
            label: 'Seller Id',
            type: { kind: 'id' },
        })
        .addFilter({
            filterField: 'orderId',
            name: 'order',
            label: 'Order Id',
            type: { kind: 'id' },
        })
        .connectToRoute(this.route);

    readonly sorts = this.createSortCollection()
        .defaultSort('createdAt', 'DESC')
        .addSort({ name: 'id' })
        .addSort({ name: 'createdAt' })
        .addSort({ name: 'updatedAt' })
        .addSort({ name: 'status' })
        .addSort({ name: 'amount' })
        .addSort({ name: 'orderId' })
        .addSort({ name: 'sellerId' })
        .connectToRoute(this.route);

    constructor(private notificationService: NotificationService) {
        super();
        super.configure({
            document: GetAllCreditExchangeDocument,
            getItems: data => data.creditExchanges,
            setVariables: (skip, take) => ({
                options: {
                    skip,
                    take,
                    sort: this.sorts.createSortInput(),
                    filter: {
                        ...this.filters.createFilterInput(),
                        ...(this.sellerId ? { sellerId: { eq: this.sellerId } } : {}),
                    },
                },
            }),
            refreshListOnChanges: [this.filters.valueChanges, this.sorts.valueChanges],
        });
    }

    refund(id: string) {
        this.dataService.mutate(RefundCreditExchangeDocument, { id }).subscribe({
            next: data => {
                this.notificationService.success(
                    `Successfuly rejected and refunded ${data.refundCreditExchange.amount} credits.`,
                );
            },
            error: () => {
                this.notificationService.error('Failed to reject request.');
            },
        });
    }

    acceptRequest(id: string) {
        this.dataService.mutate(AcceptCreditExchangeDocument, { id }).subscribe({
            next: data => {
                this.notificationService.success(`Created order for exchange request.`);
                this.router.navigate(['/orders', data.initiateCreditExchange.id]);
            },
        });
    }
}
