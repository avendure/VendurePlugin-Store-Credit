"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCreditDetailComponent = void 0;
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const core_2 = require("@vendure/admin-ui/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const store_credit_detail_graphql_1 = require("./store-credit-detail.graphql");
let StoreCreditDetailComponent = class StoreCreditDetailComponent extends core_2.TypedBaseDetailComponent {
    constructor(formBuilder, changeDetector, notificationService) {
        super();
        this.formBuilder = formBuilder;
        this.changeDetector = changeDetector;
        this.notificationService = notificationService;
        this.which = false;
        this.storeCreditKey = null;
        this.detailForm = this.formBuilder.group({
            key: [''],
            value: []
        });
    }
    ngOnInit() {
        if (this.router.url != '/extensions/store-credit/create') {
            this.which = false;
            this.init();
        }
        else {
            this.which = true;
        }
    }
    ngOnDestroy() {
        this.destroy();
    }
    generateStoreCreditKey() {
        this.storeCreditKey = this.generateRandomKey();
    }
    generateRandomKey() {
        console.log(this);
        const length = 10;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    create() {
        this.addNew()
            .pipe((0, operators_1.filter)((result) => !!result))
            .subscribe({
            next: () => {
                this.detailForm.markAsPristine();
                this.changeDetector.markForCheck();
                this.notificationService.success('common.notify-create-success', {
                    entity: 'StoreCredit'
                });
            },
            error: () => {
                this.notificationService.error('common.notify-create-error', {
                    entity: 'StoreCredit'
                });
            }
        });
    }
    update() {
        this.saveChanges()
            .pipe((0, operators_1.filter)((result) => !!result))
            .subscribe({
            next: () => {
                this.detailForm.markAsPristine();
                this.changeDetector.markForCheck();
                this.notificationService.success('common.notify-update-success', {
                    entity: 'StoreCredit'
                });
            },
            error: () => {
                this.notificationService.error('common.notify-update-error', {
                    entity: 'StoreCredit'
                });
            }
        });
    }
    addNew() {
        if (this.detailForm.dirty) {
            const formValue = this.detailForm.value;
            const input = {
                key: formValue.key || this.storeCreditKey,
                value: formValue.value
            };
            return this.dataService
                .mutate(store_credit_detail_graphql_1.CREATE_STORE_CREDIT, {
                input
            })
                .pipe((0, operators_1.map)(() => true));
        }
        else {
            return (0, rxjs_1.of)(false);
        }
    }
    saveChanges() {
        if (this.detailForm.dirty) {
            const formValue = this.detailForm.value;
            const input = {
                id: this.id,
                key: formValue.key || this.storeCreditKey,
                value: formValue.value
            };
            this.route.params.forEach((val) => {
                input.id = val.id;
            });
            return this.dataService
                .mutate(store_credit_detail_graphql_1.UPDATE_STORE_CREDIT, {
                input
            })
                .pipe((0, operators_1.map)(() => true));
        }
        else {
            return (0, rxjs_1.of)(false);
        }
    }
    setFormValues(entity) {
        console.log(entity);
        this.detailForm.patchValue({
            key: entity.key,
            value: entity.value
        });
    }
};
StoreCreditDetailComponent = __decorate([
    (0, core_1.Component)({
        selector: 'vdr-store-credit-detail',
        templateUrl: './store-credit-detail.component.html',
        styleUrls: ['./store-credit-detail.component.scss'],
        changeDetection: core_1.ChangeDetectionStrategy.Default
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder,
        core_1.ChangeDetectorRef,
        core_2.NotificationService])
], StoreCreditDetailComponent);
exports.StoreCreditDetailComponent = StoreCreditDetailComponent;
