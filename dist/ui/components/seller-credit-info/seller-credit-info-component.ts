import { Component, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { CustomDetailComponent, SharedModule, DataService } from '@vendure/admin-ui/core';
import { GetSellerCreditsQuery, GetSellerCreditsQueryVariables } from '../../generated-types';
import { GET_SELLER_CREDITS } from './seller-credit-info.graphql';
import { Seller } from '@vendure/core';

@Component({
    template: `
        <vdr-card title="Credit Balance">
            {{ creditBalance$ | async }}
        </vdr-card>`,
    standalone: true,
    imports: [SharedModule],
})
export class SellerCreditInfoComponent implements CustomDetailComponent, OnInit {

    entity$: Observable<Seller>
    detailForm: FormGroup;

    creditBalance$: Observable<number>;

    constructor(
        private dataService: DataService,
    ) { }

    ngOnInit() {
        this.creditBalance$ = this.entity$.pipe(
            switchMap(entity => {
                return this.dataService.query<GetSellerCreditsQuery, GetSellerCreditsQueryVariables>(GET_SELLER_CREDITS, {
                    id: entity.id.toString(),
                }).mapSingle(data => data.seller?.storeCredit || 0);
            }),
        );
    }
}