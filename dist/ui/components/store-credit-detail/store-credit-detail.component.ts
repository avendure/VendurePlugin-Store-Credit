import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    TypedBaseDetailComponent,
    SharedModule,
    CurrencyCode,
    NotificationService,
} from '@vendure/admin-ui/core';
import { Observable, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import {
    CreateStoreCreditMutation,
    CreateStoreCreditMutationVariables,
    StoreCreditsFragmentDoc,
    UpdateStoreCreditMutation,
    UpdateStoreCreditMutationVariables,
    StoreCreditsFragment,
    GetStoreCreditQuery,
} from '../../generated-types';

import { CREATE_STORE_CREDIT, UPDATE_STORE_CREDIT } from './store-credit-detail.graphql';

@Component({
    imports: [SharedModule],
    standalone: true,
    selector: 'vdr-store-credit-detail',
    templateUrl: './store-credit-detail.component.html',
    styleUrls: ['./store-credit-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class StoreCreditDetailComponent
    extends TypedBaseDetailComponent<typeof StoreCreditsFragmentDoc, keyof StoreCreditsFragment>
    implements OnInit, OnDestroy
{
    storeCreditKey: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
    ) {
        super();
    }

    detailForm = this.formBuilder.nonNullable.group({
        id: '',
        value: 0,
        perUserLimit: 0,
        name: '',
        key: 'Will be auto generated',
        price: 0,
        claimable: false,
    });

    currencyCode: CurrencyCode;

    ngOnInit() {
        this.init();
        this.dataService.settings.getActiveChannel().single$.subscribe(data => {
            this.currencyCode = data.activeChannel.defaultCurrencyCode;
        });
    }

    ngOnDestroy() {
        this.destroy();
    }

    create() {
        this.addNew().subscribe({
            next: id => {
                this.detailForm.markAsPristine();
                this.changeDetector.markForCheck();
                this.notificationService.success('common.notify-create-success', {
                    entity: 'StoreCredit',
                });
                this.router.navigate(['../', id], {
                    relativeTo: this.route,
                });
            },
            error: () => {
                this.notificationService.error('common.notify-create-error', {
                    entity: 'StoreCredit',
                });
            },
        });
    }

    update() {
        this.saveChanges()
            .pipe(filter(result => !!result))
            .subscribe({
                next: () => {
                    this.detailForm.markAsPristine();
                    this.changeDetector.markForCheck();
                    this.notificationService.success('common.notify-update-success', {
                        entity: 'StoreCredit',
                    });
                },
                error: () => {
                    this.notificationService.error('common.notify-update-error', {
                        entity: 'StoreCredit',
                    });
                },
            });
    }

    private addNew(): Observable<string | undefined> {
        const { value = 0, name = 'Store Credit', perUserLimit, price = 0 } = this.detailForm.value;

        if (!this.detailForm.dirty || !this.detailForm.valid || perUserLimit == undefined)
            return of(undefined);

        return this.dataService
            .mutate<CreateStoreCreditMutation, CreateStoreCreditMutationVariables>(CREATE_STORE_CREDIT, {
                input: {
                    name,
                    value,
                    perUserLimit,
                    price,
                },
            })
            .pipe(map(data => data.createStoreCredit?.id));
    }

    private saveChanges(): Observable<string | undefined> {
        const formValue = this.detailForm.value;
        if (!this.detailForm.dirty || !this.detailForm.valid || !formValue.id) return of(undefined);

        return this.dataService
            .mutate<UpdateStoreCreditMutation, UpdateStoreCreditMutationVariables>(UPDATE_STORE_CREDIT, {
                input: {
                    id: formValue.id,
                    perUserLimit: formValue.perUserLimit || undefined,
                    value: formValue.value || undefined,
                    name: formValue.name || undefined,
                },
            })
            .pipe(map(data => data.updateStoreCredit.id));
    }

    protected setFormValues(entity: NonNullable<GetStoreCreditQuery['storeCredit']>) {
        this.detailForm.patchValue({
            id: entity.id,
            name: entity.variant?.name,
            value: entity.value,
            perUserLimit: entity.perUserLimit,
            price: entity.variant?.price,
            key: entity.key,
            claimable: !entity.variant,
        });
    }
}
