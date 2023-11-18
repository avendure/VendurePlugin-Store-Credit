"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialData = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
exports.initialData = {
    paymentMethods: [
        {
            name: "store-credit",
            handler: {
                code: "credit-store-payment",
                arguments: [],
            },
        },
    ],
    defaultLanguage: generated_types_1.LanguageCode.en,
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
