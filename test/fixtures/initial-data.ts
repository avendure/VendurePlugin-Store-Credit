import { LanguageCode } from "@vendure/common/lib/generated-types";
import { InitialData } from "@vendure/core";

export const initialData: InitialData = {
    paymentMethods: [
        {
            name: "store-credit",
            handler: {
                code: "credit-store-payment",
                arguments: [],
            },
        },
    ],
    defaultLanguage: LanguageCode.en,
    defaultZone: "Europe",
    taxRates: [{ name: "Standard Tax", percentage: 20 }],
    shippingMethods: [{ name: "Standard Shipping", price: 500 }],
    countries: [{ name: "United Kingdom", code: "GB", zone: "Europe" }],
    collections: [
        {
            name: "Computers",
            filters: [
                {
                    code: "facet-value-filter",
                    args: { facetValueNames: ["computers"], containsAny: false },
                },
            ],
        },
        {
            name: "Electronics",
            filters: [
                {
                    code: "facet-value-filter",
                    args: { facetValueNames: ["electronics"], containsAny: false },
                },
            ],
        },
    ],
};
