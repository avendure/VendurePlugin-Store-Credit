import { ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TypedBaseDetailComponent, NotificationService } from '@vendure/admin-ui/core';
import { StoreCreditsFragmentDoc, StoreCreditsFragment } from '../../generated-types';
export declare class StoreCreditDetailComponent extends TypedBaseDetailComponent<typeof StoreCreditsFragmentDoc, keyof StoreCreditsFragment> implements OnInit, OnDestroy {
    private formBuilder;
    private changeDetector;
    private notificationService;
    detailForm: FormGroup;
    which: boolean;
    storeCreditKey: string | null;
    constructor(formBuilder: FormBuilder, changeDetector: ChangeDetectorRef, notificationService: NotificationService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    generateStoreCreditKey(): void;
    private generateRandomKey;
    create(): void;
    update(): void;
    private addNew;
    private saveChanges;
    protected setFormValues(entity: StoreCreditsFragment): void;
}
