import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import {
    RelationCustomFieldConfig,
    SharedModule,
    FormInputComponent,
    DataService,
    Permission,
} from "@vendure/admin-ui/core";

@Component({
    template: `
		<vdr-relation-customer-input
			[parentFormControl]="formControl"
			[config]="config"
			[readonly]="readonly"
		></vdr-relation-customer-input>
	`,
    standalone: true,
    imports: [SharedModule],
})
export class SellerCustomerFormInputComponent
    implements OnInit, FormInputComponent<RelationCustomFieldConfig>
{
    readonly: boolean;
    config: RelationCustomFieldConfig;
    formControl: FormControl;

    constructor(
        private dataService: DataService,
        private changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.dataService.client.userStatus().single$.subscribe((data) => {
            this.readonly = !data.userStatus.permissions.includes(
                Permission.SuperAdmin
            );
            this.changeDetectorRef.markForCheck();
        });
    }
}
