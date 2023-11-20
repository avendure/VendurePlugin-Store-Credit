import { OnInit, ChangeDetectorRef } from "@angular/core";
import { CustomDetailComponent, DataService, NotificationService } from "@vendure/admin-ui/core";
import { Observable } from "rxjs";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
export declare class CreditsInSellerComponent implements OnInit, CustomDetailComponent {
    private dataService;
    private route;
    private formBuilder;
    private notificationService;
    private changeDetectorRef;
    detailForm: FormGroup;
    entity$: Observable<any[]>;
    id: string;
    constructor(dataService: DataService, route: ActivatedRoute, formBuilder: FormBuilder, notificationService: NotificationService, changeDetectorRef: ChangeDetectorRef);
    ngOnInit(): void;
    transfer(): void;
}
