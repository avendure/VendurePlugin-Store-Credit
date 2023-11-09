import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CustomDetailComponent,
  DataService,
  NotificationService,
} from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import {
  GET_SELLER_AND_CUSTOMER_STORE_CREDITS,
  TRANSFER_CREDIT_FROM_SELLER_TO_CUSTOMER,
} from './creditsInSeller.graphql';
import { StoreCredit } from './generated-types';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'creditsInSeller-component',
  templateUrl: './creditsInSeller.html',
  styleUrls: ['./creditsInSeller.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  // standalone: true,
})
export class CreditsInSellerComponent implements OnInit, CustomDetailComponent {
  detailForm: FormGroup;
  entity$: Observable<any[]>;
  id: string;
  // customerAccountBalance: number = 0;
  // sellerAccountBalance: number = 0;
  refresh;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.id = '';
    this.route.params.forEach((v) => (this.id = v.id));

    this.entity$ = this.dataService
      .query(GET_SELLER_AND_CUSTOMER_STORE_CREDITS, {
        sellerId: this.id,
      })
      .mapStream((data: any) => data.getSellerANDCustomerStoreCredits);
    this.entity$.subscribe((data: any) => {
      this.detailForm = new FormGroup({
        customerAccountBalance: new FormControl(data.customerAccountBalance),
        sellerAccountBalance: new FormControl(data.sellerAccountBalance),
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  transfer() {
    const sellerId = this.id;
    const value = Number(this.detailForm.value.sellerAccountBalance);
    // console.log(value, sellerId);

    this.dataService
      .query(TRANSFER_CREDIT_FROM_SELLER_TO_CUSTOMER, { value, sellerId })
      .mapSingle((data: any) => data.transferCreditfromSellerToCustomer)
      .subscribe((data) => {
        console.log(data);
        this.detailForm.patchValue({
          customerAccountBalance: data.customerAccountBalance,
          sellerAccountBalance: data.sellerAccountBalance,
        });
        this.notificationService.success('Transfer Successful!');

        location.reload();
        return data;
      });
    this.notificationService.success('Transfer Successful!');
    this.changeDetectorRef.detectChanges();
    this.ngOnInit();
  }
}
