import { Component, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { CustomDetailComponent, SharedModule, DataService } from '@vendure/admin-ui/core';
import { Customer, GetCustomerCreditsQuery, GetCustomerCreditsQueryVariables } from '../../generated-types';
import { GET_CUSTOMER_CREDITS } from './customer-credit-info.graphql';

@Component({
    template: `
        <vdr-card title="Credit Balance">
            {{ creditBalance$ | async }}
        </vdr-card>`,
    standalone: true,
    imports: [SharedModule],
})
export class CustomerCreditInfoComponent implements CustomDetailComponent, OnInit {

    entity$: Observable<Customer>
    detailForm: FormGroup;

    creditBalance$: Observable<number>;

    constructor(
        private dataService: DataService,
    ) { }

    ngOnInit() {
        this.creditBalance$ = this.entity$.pipe(
            switchMap(entity => {
                return this.dataService.query<GetCustomerCreditsQuery, GetCustomerCreditsQueryVariables>(GET_CUSTOMER_CREDITS, {
                    id: entity.id,
                }).mapSingle(data => data.customer?.user?.customFields?.accountBalance || 0);
            }),
        );
    }
}