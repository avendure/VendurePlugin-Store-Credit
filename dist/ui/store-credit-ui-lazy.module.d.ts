import { StoreCreditsFragment } from './generated-types';
import { Observable } from 'rxjs';
export declare class StoreCreditUIModule {
}
export declare function storeCreditDetailBreadcrumb(resolved: {
    detail: {
        entity: Observable<StoreCreditsFragment>;
    };
}): Observable<{
    label: string;
    link: string[];
    requiresPermission: string;
}[]>;
