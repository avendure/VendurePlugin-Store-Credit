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
exports.CreditsInSellerComponent = void 0;
const core_1 = require("@angular/core");
const core_2 = require("@vendure/admin-ui/core");
const forms_1 = require("@angular/forms");
const creditsInSeller_graphql_1 = require("./creditsInSeller.graphql");
const router_1 = require("@angular/router");
let CreditsInSellerComponent = class CreditsInSellerComponent {
    // customerAccountBalance: number = 0;
    // sellerAccountBalance: number = 0;
    constructor(dataService, route, formBuilder, notificationService, changeDetectorRef) {
        this.dataService = dataService;
        this.route = route;
        this.formBuilder = formBuilder;
        this.notificationService = notificationService;
        this.changeDetectorRef = changeDetectorRef;
    }
    ngOnInit() {
        this.id = "";
        this.route.params.forEach((v) => (this.id = v.id));
        this.entity$ = this.dataService
            .query(creditsInSeller_graphql_1.GET_SELLER_AND_CUSTOMER_STORE_CREDITS, {
            sellerId: this.id,
        })
            .mapStream((data) => data.getSellerANDCustomerStoreCredits);
        this.entity$.subscribe((data) => {
            this.detailForm = new forms_1.FormGroup({
                customerAccountBalance: new forms_1.FormControl(data.customerAccountBalance),
                sellerAccountBalance: new forms_1.FormControl(data.sellerAccountBalance),
            });
            this.changeDetectorRef.detectChanges();
        });
    }
    transfer() {
        const sellerId = this.id;
        const value = Number(this.detailForm.value.sellerAccountBalance);
        // console.log(value, sellerId);
        this.dataService
            .query(creditsInSeller_graphql_1.TRANSFER_CREDIT_FROM_SELLER_TO_CUSTOMER, { value, sellerId })
            .mapSingle((data) => data.transferCreditfromSellerToCustomer)
            .subscribe((data) => {
            console.log(data);
            this.detailForm.patchValue({
                customerAccountBalance: data.customerAccountBalance,
                sellerAccountBalance: data.sellerAccountBalance,
            });
            this.notificationService.success("Transfer Successful!");
            location.reload();
            return data;
        });
        this.notificationService.success("Transfer Successful!");
        this.changeDetectorRef.detectChanges();
        this.ngOnInit();
    }
};
CreditsInSellerComponent = __decorate([
    (0, core_1.Component)({
        selector: "creditsInSeller-component",
        templateUrl: "./creditsInSeller.html",
        styleUrls: ["./creditsInSeller.scss"],
        // changeDetection: ChangeDetectionStrategy.OnPush,
        // standalone: true,
    }),
    __metadata("design:paramtypes", [core_2.DataService,
        router_1.ActivatedRoute,
        forms_1.FormBuilder,
        core_2.NotificationService,
        core_1.ChangeDetectorRef])
], CreditsInSellerComponent);
exports.CreditsInSellerComponent = CreditsInSellerComponent;
