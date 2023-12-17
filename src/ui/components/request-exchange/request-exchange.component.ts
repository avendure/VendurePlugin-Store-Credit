import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ResultOf } from "@graphql-typed-document-node/core";
import {
    CustomDetailComponent,
    GetSellerDetailDocument,
    SharedModule,
    DataService,
    NotificationService,
} from "@vendure/admin-ui/core";
import { Observable } from "rxjs";
import { FormGroup, FormControl } from "@angular/forms";
import { CreditExchangesListComponent } from "../credit-exchange-list/credit-exchange-list.component";
import { RequestCreditExchangeDocument } from "../../generated-types";

type SellerEntity = ResultOf<typeof GetSellerDetailDocument>["seller"];

@Component({
    imports: [SharedModule, CreditExchangesListComponent],
    standalone: true,
    selector: "request-credit-exchange",
    template: `<vdr-card style="margin-top: 1rem;" [paddingX]="false">
		<vdr-action-bar>
			<vdr-ab-left></vdr-ab-left>
			<vdr-ab-right>
				<div>
					<input type="number" [formControl]="amount" /><button
						class="btn"
						(click)="request()"
					>
						Request Exchange
					</button>
				</div>
			</vdr-ab-right>
		</vdr-action-bar>
		<store-credit-exchanges></store-credit-exchanges
	></vdr-card>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestExchange implements OnInit, CustomDetailComponent {
    detailForm: FormGroup;
    entity$: Observable<SellerEntity>;

    amount = new FormControl(0);

    constructor(
        private dataService: DataService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() { }

    request() {
        const value = this.amount.value;
        if (value) {
            this.dataService
                .mutate(RequestCreditExchangeDocument, { amount: value })
                .subscribe({
                    next: (data) => {
                        this.notificationService.success(
                            `Requested for ${data.requestCreditExchange.amount} credit exchange.`
                        );
                    },
                });
        }
    }
}
