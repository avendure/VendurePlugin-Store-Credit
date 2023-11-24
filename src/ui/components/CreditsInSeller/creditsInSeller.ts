import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ResultOf } from '@graphql-typed-document-node/core';
import {
    CustomDetailComponent,
    DataService,
    NotificationService,
    GetSellerDetailDocument,
} from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import {
    GetSellerAndCustomerStoreCreditsDocument,
    TransferCreditfromSellerToCustomerDocument,
} from '../../generated-types';

type SellerEntity = ResultOf<typeof GetSellerDetailDocument>['seller'];

@Component({
    selector: 'creditsInSeller-component',
    templateUrl: './creditsInSeller.html',
    styleUrls: ['./creditsInSeller.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsInSellerComponent implements OnInit, CustomDetailComponent {
    detailForm: FormGroup;
    entity$: Observable<SellerEntity>;

    id: string;
    customerBalance: number = 0;
    sellerBalance: number = 0;

    constructor(
        private dataService: DataService,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.id = '';
        this.route.params.forEach(v => (this.id = v.id));

        this.dataService
            .query(GetSellerAndCustomerStoreCreditsDocument, {
                sellerId: this.id,
            })
            .mapStream(data => data.getSellerANDCustomerStoreCredits)
            .subscribe(credits => {
                this.customerBalance = credits.customerAccountBalance || 0;
                this.sellerBalance = credits.sellerAccountBalance || 0;
                this.changeDetectorRef.markForCheck();
            });
    }

    transfer() {
        this.dataService
            .mutate(TransferCreditfromSellerToCustomerDocument, {
                value: this.sellerBalance,
                sellerId: this.id,
            })
            .pipe(map(d => d.transferCreditfromSellerToCustomer))
            .subscribe(data => {
                this.notificationService.success('Transfer Successful!');
                this.sellerBalance = data.sellerAccountBalance || this.sellerBalance;
                this.customerBalance = data.customerAccountBalance || this.customerBalance;
                this.changeDetectorRef.markForCheck();
            });
    }
}
