import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  TypedBaseDetailComponent,
  NotificationService
} from '@vendure/admin-ui/core';
import { Observable, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import {
  CreateStoreCreditMutation,
  CreateStoreCreditMutationVariables,
  StoreCreditsFragmentDoc,
  UpdateStoreCreditMutation,
  UpdateStoreCreditMutationVariables,
  StoreCreditAddInput,
  StoreCreditUpdateInput,
  StoreCreditsFragment
} from '../../generated-types';

import {
  CREATE_STORE_CREDIT,
  UPDATE_STORE_CREDIT
} from './store-credit-detail.graphql';

@Component({
  selector: 'vdr-store-credit-detail',
  templateUrl: './store-credit-detail.component.html',
  styleUrls: ['./store-credit-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class StoreCreditDetailComponent
  extends TypedBaseDetailComponent<
    typeof StoreCreditsFragmentDoc,
    keyof StoreCreditsFragment
  >
  implements OnInit, OnDestroy
{
  detailForm: FormGroup;
  which = false;
  storeCreditKey: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    super();
    this.detailForm = this.formBuilder.group({
      key: [''],
      value: []
    });
  }

  ngOnInit() {
    if (this.router.url != '/extensions/store-credit/create') {
      this.which = false;
      this.init();
    } else {
      this.which = true;
    }
  }

  ngOnDestroy() {
    this.destroy();
  }

  generateStoreCreditKey() {
    this.storeCreditKey = this.generateRandomKey();
  }

  private generateRandomKey(): string {
    console.log(this);
    const length = 10;
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  create() {
    this.addNew()
      .pipe(filter((result) => !!result))
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
      .pipe(filter((result) => !!result))
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

  private addNew(): Observable<boolean> {
    if (this.detailForm.dirty) {
      const formValue = this.detailForm.value;
      const input: StoreCreditAddInput = {
        key: formValue.key || this.storeCreditKey,
        value: formValue.value
      };

      return this.dataService
        .mutate<CreateStoreCreditMutation, CreateStoreCreditMutationVariables>(
          CREATE_STORE_CREDIT,
          {
            input
          }
        )
        .pipe(map(() => true));
    } else {
      return of(false);
    }
  }

  private saveChanges(): Observable<boolean> {
    if (this.detailForm.dirty) {
      const formValue = this.detailForm.value;
      const input: StoreCreditUpdateInput = {
        id: this.id,
        key: formValue.key || this.storeCreditKey,
        value: formValue.value
      };

      this.route.params.forEach((val) => {
        input.id = val.id;
      });

      return this.dataService
        .mutate<UpdateStoreCreditMutation, UpdateStoreCreditMutationVariables>(
          UPDATE_STORE_CREDIT,
          {
            input
          }
        )
        .pipe(map(() => true));
    } else {
      return of(false);
    }
  }

  protected setFormValues(entity: StoreCreditsFragment) {
    console.log(entity);
    this.detailForm.patchValue({
      key: entity.key,
      value: entity.value
    });
  }
}
