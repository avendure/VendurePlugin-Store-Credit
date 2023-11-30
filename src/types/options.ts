import { CurrencyCode } from '@vendure/core';

type CreditConversion = { [key in CurrencyCode]?: number } & {
    default: number;
};

export type StoreCreditPluginOptions = {
    npp: {
        name: string;
        slug: string;
    };
    creditToCurrencyFactor: CreditConversion;
    platformFee: { type: 'fixed' | 'percent'; value: number };
};
