import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Dialog } from "@vendure/admin-ui/core";
@Component({
	selector: "credit-exchange-staus-dialog",
	template: ` <ng-template vdrDialogTitle>{{
			"order.select-state" | translate
		}}</ng-template>
		<p>{{ message | translate }}</p>
		<vdr-form-field>
			<select name="state" [(ngModel)]="selectedState">
				<option *ngFor="let state of nextStates" [value]="state">
					{{ state }}
				</option>
			</select>
		</vdr-form-field>
		<ng-template vdrDialogButtons>
			<button
				type="submit"
				*ngIf="cancellable"
				(click)="cancel()"
				class="btn btn-secondary"
			>
				{{ "common.cancel" | translate }}
			</button>
			<button
				type="submit"
				(click)="select()"
				class="btn btn-primary"
				[disabled]="!selectedState"
			>
				Update
			</button>
		</ng-template>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditExchangeStatusDialog implements Dialog<string> {
	resolveWith: (result?: string) => void;
	nextStates: Array<string> = [];
	message = "";
	cancellable: boolean;
	selectedState: string;

	select() {
		if (this.selectedState) {
			this.resolveWith(this.selectedState);
		}
	}

	cancel() {
		this.resolveWith();
	}
}
