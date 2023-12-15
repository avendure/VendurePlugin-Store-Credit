import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { marker as _ } from "@biesbjerg/ngx-translate-extract-marker";
import {
	TypedBaseListComponent,
	NotificationService,
} from "@vendure/admin-ui/core";

import {
	AcceptCreditExchangeDocument,
	GetAllCreditExchangeDocument,
	UpdateCreditExchangeStatusDocument,
} from "../../generated-types";

@Component({
	selector: "credit-exchanges",
	templateUrl: "./credit-exchange-list.component.html",
	styleUrls: ["./credit-exchange-list.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditExchangesListComponent
	extends TypedBaseListComponent<
		typeof GetAllCreditExchangeDocument,
		"creditExchanges"
	>
	implements OnInit
{
	readonly filters = this.createFilterCollection()
		.addDateFilters()
		.addIdFilter()
		.addFilter({
			filterField: "amount",
			name: "amount",
			label: "Amount",
			type: { kind: "number" },
		})
		.addFilter({
			filterField: "status",
			name: "status",
			label: "Status",
			type: { kind: "text" },
		})
		.addFilter({
			filterField: "sellerId",
			name: "seller",
			label: "Seller Id",
			type: { kind: "id" },
		})
		.addFilter({
			filterField: "orderId",
			name: "order",
			label: "Order Id",
			type: { kind: "id" },
		})
		.connectToRoute(this.route);

	readonly sorts = this.createSortCollection()
		.defaultSort("createdAt", "DESC")
		.addSort({ name: "id" })
		.addSort({ name: "createdAt" })
		.addSort({ name: "updatedAt" })
		.addSort({ name: "status" })
		.addSort({ name: "amount" })
		.addSort({ name: "orderId" })
		.addSort({ name: "sellerId" })
		.connectToRoute(this.route);

	constructor(private notificationService: NotificationService) {
		super();
		super.configure({
			document: GetAllCreditExchangeDocument,
			getItems: (data) => data.creditExchanges,
			setVariables: (skip, take) => ({
				options: {
					skip,
					take,
					sort: this.sorts.createSortInput(),
					filter: this.filters.createFilterInput(),
				},
			}),
			refreshListOnChanges: [
				this.filters.valueChanges,
				this.sorts.valueChanges,
			],
		});
	}

	updateStatus(ids: string[], status: string) {
		this.dataService
			.mutate(UpdateCreditExchangeStatusDocument, { ids, status })
			.subscribe({
				next: (data) => {
					const affected = data.updateCreditExchangeStatus;
					this.notificationService.success(
						`Updated status of ${affected} request.`
					);
				},
				error: () => {
					this.notificationService.error("Failed to update status");
				},
			});
	}

	acceptRequest(id: string) {
		this.dataService.mutate(AcceptCreditExchangeDocument, { id }).subscribe({
			next: (data) => {
				this.notificationService.success(`Created order for exchange request.`);
				this.router.navigate(["/orders", data.initiateCreditExchange.id]);
			},
		});
	}
}
