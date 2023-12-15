import { marker as _ } from "@biesbjerg/ngx-translate-extract-marker";
import { ItemOf } from "@vendure/admin-ui/core";
import {
	BulkAction,
	DataService,
	ModalService,
	NotificationService,
} from "@vendure/admin-ui/core";
import {
	GetAllCreditExchangeQuery,
	UpdateCreditExchangeStatusDocument,
} from "../../generated-types";
import { CreditExchangesListComponent } from "./credit-exchange-list.component";
import { CreditExchangeStatusDialog } from "./credit-exchange-status-dialog.component";

export const UpdateCreditExchangeStatus: BulkAction<
	ItemOf<GetAllCreditExchangeQuery, "creditExchanges">,
	CreditExchangesListComponent
> = {
	location: "exchange-list",
	label: "Update status",
	icon: "check",
	requiresPermission: "SuperAdmin",
	onClick: ({ injector, selection, hostComponent, clearSelection }) => {
		const modalService = injector.get(ModalService);
		const dataService = injector.get(DataService);
		const notificationService = injector.get(NotificationService);

		const exchangeIds = selection.map((s) => s.id);
		const s = exchangeIds.length > 1 ? "s" : "";

		modalService
			.fromComponent(CreditExchangeStatusDialog, {
				locals: {
					message: `Update status of ${exchangeIds.length} exchange request${s}`,
					nextStates: ["Pending", "Processing", "Paid", "Rejected"],
					cancellable: true,
				},
				closable: false,
				size: "md",
			})
			.subscribe((selectedStatus) => {
				if (selectedStatus) {
					dataService
						.mutate(UpdateCreditExchangeStatusDocument, {
							ids: exchangeIds,
							status: selectedStatus,
						})
						.subscribe({
							next: (data) => {
								const s = data.updateCreditExchangeStatus > 1 ? "s" : "";
								notificationService.success(
									`Updated status of ${data.updateCreditExchangeStatus} request${s} to ${selectedStatus}`
								);
								clearSelection();
								hostComponent.refresh();
							},
						});
				}
			});
	},
};
