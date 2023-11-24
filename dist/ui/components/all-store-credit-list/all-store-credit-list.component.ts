import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  TypedBaseListComponent,
  NotificationService,
  ModalService
} from '@vendure/admin-ui/core';

import {
  GetAllStoreCreditsDocument,
  LogicalOperator,
  DeleteStoreCreditMutation,
  DeleteStoreCreditMutationVariables
} from '../../generated-types';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DELETE_STORE_CREDIT } from './all-store-credit-list.graphql';

@Component({
  selector: 'vdr-all-store-credit-list',
  templateUrl: './all-store-credit-list.component.html',
  styleUrls: ['./all-store-credit-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllStoreCreditListComponent
  extends TypedBaseListComponent<
    typeof GetAllStoreCreditsDocument,
    'storeCredits'
  >
  implements OnInit
{
  searchTerm = new FormControl('');
  Quotes: any;

  readonly filters = this.createFilterCollection()
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

  readonly sorts = this.createSortCollection()
    .defaultSort('createdAt', 'DESC')
    .addSort({ name: 'createdAt' })
    .addSort({ name: 'updatedAt' })
    .addSort({ name: 'key' })
    .addSort({ name: 'value' })
    .addSort({ name: 'customerId' })
    .connectToRoute(this.route);

  constructor(
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {
    super();
    super.configure({
      document: GetAllStoreCreditsDocument,
      getItems: (data) => data.storeCredits,
      setVariables: (skip, take) => ({
        options: {
          skip,
          take,
          sort: this.sorts.createSortInput(),
          filter: this.filters.createFilterInput(),
          filterOperator: LogicalOperator.AND
        }
      }),
      refreshListOnChanges: [this.filters.valueChanges, this.sorts.valueChanges]
    });
  }

  getCustomerUrl(customerId: string): string {
    const currentDomain = window.location.origin;
    return `${currentDomain}/admin/customer/customers/${customerId}`;
  }

  deleteStoreCredit(id: string) {
    this.modalService
      .dialog({
        title: 'Delete Store Credit?',
        buttons: [
          { type: 'secondary', label: _('common.cancel') },
          { type: 'danger', label: _('common.delete'), returnValue: true }
        ]
      })
      .pipe(
        switchMap((response) =>
          response
            ? this.dataService.mutate<
                DeleteStoreCreditMutation,
                DeleteStoreCreditMutationVariables
              >(DELETE_STORE_CREDIT, { input: id })
            : EMPTY
        )
      )
      .subscribe({
        next: () => {
          this.notificationService.success(_('common.notify-delete-success'), {
            entity: 'StoreCredit'
          });
          this.refresh();
        },
        error: () => {
          this.notificationService.error(_('common.notify-update-error'), {
            entity: 'StoreCredit'
          });
        }
      });
  }
}
