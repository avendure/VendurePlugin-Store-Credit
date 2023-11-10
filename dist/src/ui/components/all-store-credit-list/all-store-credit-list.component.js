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
exports.AllStoreCreditListComponent = void 0;
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const ngx_translate_extract_marker_1 = require("@biesbjerg/ngx-translate-extract-marker");
const core_2 = require("@vendure/admin-ui/core");
const generated_types_1 = require("../../generated-types");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const all_store_credit_list_graphql_1 = require("./all-store-credit-list.graphql");
let AllStoreCreditListComponent = class AllStoreCreditListComponent extends core_2.TypedBaseListComponent {
    constructor(modalService, notificationService) {
        super();
        this.modalService = modalService;
        this.notificationService = notificationService;
        this.searchTerm = new forms_1.FormControl('');
        this.filters = this.createFilterCollection()
            .addDateFilters()
            .addFilter({
            name: 'key',
            type: { kind: 'text' },
            label: 'Key',
            filterField: 'key'
        })
            .addFilter({
            name: 'value',
            type: { kind: 'number' },
            label: 'Value',
            filterField: 'value'
        })
            .addFilter({
            name: 'isClaimed',
            type: { kind: 'boolean' },
            label: 'IsClaimed',
            filterField: 'isClaimed'
        })
            .addFilter({
            name: 'customerId',
            type: { kind: 'text' },
            label: 'CustomerId',
            filterField: 'customerId'
        })
            .connectToRoute(this.route);
        this.sorts = this.createSortCollection()
            .defaultSort('createdAt', 'DESC')
            .addSort({ name: 'createdAt' })
            .addSort({ name: 'updatedAt' })
            .addSort({ name: 'key' })
            .addSort({ name: 'value' })
            .addSort({ name: 'customerId' })
            .connectToRoute(this.route);
        super.configure({
            document: generated_types_1.GetAllStoreCreditsDocument,
            getItems: (data) => data.storeCredits,
            setVariables: (skip, take) => ({
                options: {
                    skip,
                    take,
                    sort: this.sorts.createSortInput(),
                    filter: this.filters.createFilterInput(),
                    filterOperator: generated_types_1.LogicalOperator.AND
                }
            }),
            refreshListOnChanges: [this.filters.valueChanges, this.sorts.valueChanges]
        });
    }
    getCustomerUrl(customerId) {
        const currentDomain = window.location.origin;
        return `${currentDomain}/admin/customer/customers/${customerId}`;
    }
    deleteStoreCredit(id) {
        this.modalService
            .dialog({
            title: 'Delete Store Credit?',
            buttons: [
                { type: 'secondary', label: (0, ngx_translate_extract_marker_1.marker)('common.cancel') },
                { type: 'danger', label: (0, ngx_translate_extract_marker_1.marker)('common.delete'), returnValue: true }
            ]
        })
            .pipe((0, operators_1.switchMap)((response) => response
            ? this.dataService.mutate(all_store_credit_list_graphql_1.DELETE_STORE_CREDIT, { input: id })
            : rxjs_1.EMPTY))
            .subscribe({
            next: () => {
                this.notificationService.success((0, ngx_translate_extract_marker_1.marker)('common.notify-delete-success'), {
                    entity: 'StoreCredit'
                });
                this.refresh();
            },
            error: () => {
                this.notificationService.error((0, ngx_translate_extract_marker_1.marker)('common.notify-update-error'), {
                    entity: 'StoreCredit'
                });
            }
        });
    }
};
AllStoreCreditListComponent = __decorate([
    (0, core_1.Component)({
        selector: 'vdr-all-store-credit-list',
        templateUrl: './all-store-credit-list.component.html',
        styleUrls: ['./all-store-credit-list.component.scss'],
        changeDetection: core_1.ChangeDetectionStrategy.OnPush
    }),
    __metadata("design:paramtypes", [core_2.ModalService,
        core_2.NotificationService])
], AllStoreCreditListComponent);
exports.AllStoreCreditListComponent = AllStoreCreditListComponent;
