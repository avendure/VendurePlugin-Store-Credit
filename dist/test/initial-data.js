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
                arguments: [{ name: "automaticSettle", value: "false" }],
            },
        },
    ],
    defaultLanguage: generated_types_1.LanguageCode.en,
    defaultZone: "Europe",
    taxRates: [
        { name: "Standard Tax", percentage: 20 },
        { name: "Reduced Tax", percentage: 10 },
        { name: "Zero Tax", percentage: 0 },
    ],
    shippingMethods: [
        { name: "Standard Shipping", price: 500 },
        { name: "Express Shipping", price: 1000 },
    ],
    countries: [
        { name: "Australia", code: "AU", zone: "Oceania" },
        { name: "Austria", code: "AT", zone: "Europe" },
        { name: "Canada", code: "CA", zone: "Americas" },
        { name: "China", code: "CN", zone: "Asia" },
        { name: "South Africa", code: "ZA", zone: "Africa" },
        { name: "United Kingdom", code: "GB", zone: "Europe" },
        { name: "United States of America", code: "US", zone: "Americas" },
        { name: "Nederland", code: "NL", zone: "Europe" },
    ],
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
    ],
};
