"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeCreditDetailBreadcrumb = exports.StoreCreditUIModule = void 0;
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const core_2 = require("@vendure/admin-ui/core");
const all_store_credit_list_component_1 = require("./components/all-store-credit-list/all-store-credit-list.component");
const store_credit_detail_component_1 = require("./components/store-credit-detail/store-credit-detail.component");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const all_store_credit_list_graphql_1 = require("./components/all-store-credit-list/all-store-credit-list.graphql");
let StoreCreditUIModule = exports.StoreCreditUIModule = class StoreCreditUIModule {
};
exports.StoreCreditUIModule = StoreCreditUIModule = __decorate([
    (0, core_1.NgModule)({
        imports: [
            core_2.SharedModule,
            router_1.RouterModule.forChild([
                {
                    path: '',
                    pathMatch: 'full',
                    component: all_store_credit_list_component_1.AllStoreCreditListComponent,
                    data: { breadcrumb: 'Store Credits' }
                },
                {
                    path: 'create',
                    component: store_credit_detail_component_1.StoreCreditDetailComponent,
                    data: {
                        breadcrumb: [
                            {
                                label: 'Store Credits',
                                link: ['/extensions', 'store-credit'],
                                requiresPermission: 'SuperAdmin'
                            },
                            {
                                label: 'Create Store Credit',
                                link: [],
                                requiresPermission: 'SuperAdmin'
                            }
                        ]
                    }
                },
                {
                    path: ':id',
                    component: store_credit_detail_component_1.StoreCreditDetailComponent,
                    resolve: {
                        detail: (route) => {
                            return (0, core_1.inject)(core_2.DataService)
                                .mutate(all_store_credit_list_graphql_1.GET_STORE_CREDIT, { id: route.paramMap.get('id') })
                                .pipe((0, operators_1.map)((data) => ({ entity: (0, rxjs_1.of)(data.storeCredit) })));
                        }
                    },
                    data: { breadcrumb: storeCreditDetailBreadcrumb }
                }
            ])
        ],
        declarations: [all_store_credit_list_component_1.AllStoreCreditListComponent, store_credit_detail_component_1.StoreCreditDetailComponent]
    })
], StoreCreditUIModule);
function storeCreditDetailBreadcrumb(resolved) {
    return resolved.detail.entity.pipe((0, operators_1.map)((entity) => [
        {
            label: 'Store Credits',
            link: ['/extensions', 'store-credit'],
            requiresPermission: 'SuperAdmin'
        },
        {
            label: 'Update Store Credit',
            link: [],
            requiresPermission: 'SuperAdmin'
        }
    ]));
}
exports.storeCreditDetailBreadcrumb = storeCreditDetailBreadcrumb;
