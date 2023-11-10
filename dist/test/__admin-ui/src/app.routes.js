"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const ngx_translate_extract_marker_1 = require("@biesbjerg/ngx-translate-extract-marker");
const core_1 = require("@vendure/admin-ui/core");
const extension_routes_1 = require("./extension.routes");
exports.routes = [
    { path: 'login', loadChildren: () => Promise.resolve().then(() => __importStar(require('@vendure/admin-ui/login'))).then(m => m.LoginModule) },
    {
        path: '',
        canActivate: [core_1.AuthGuard],
        component: core_1.AppShellComponent,
        data: {
            breadcrumb: (0, ngx_translate_extract_marker_1.marker)('breadcrumb.dashboard'),
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadChildren: () => Promise.resolve().then(() => __importStar(require('@vendure/admin-ui/dashboard'))).then(m => m.DashboardModule),
            },
            {
                path: 'catalog',
                loadChildren: () => Promise.resolve().then(() => __importStar(require('@vendure/admin-ui/catalog'))).then(m => m.CatalogModule),
            },
            {
                path: 'customer',
                loadChildren: () => Promise.resolve().then(() => __importStar(require('@vendure/admin-ui/customer'))).then(m => m.CustomerModule),
            },
            {
                path: 'orders',
                loadChildren: () => Promise.resolve().then(() => __importStar(require('@vendure/admin-ui/order'))).then(m => m.OrderModule),
            },
            {
                path: 'marketing',
                loadChildren: () => Promise.resolve().then(() => __importStar(require('@vendure/admin-ui/marketing'))).then(m => m.MarketingModule),
            },
            {
                path: 'settings',
                loadChildren: () => Promise.resolve().then(() => __importStar(require('@vendure/admin-ui/settings'))).then(m => m.SettingsModule),
            },
            {
                path: 'system',
                loadChildren: () => Promise.resolve().then(() => __importStar(require('@vendure/admin-ui/system'))).then(m => m.SystemModule),
            },
            ...extension_routes_1.extensionRoutes,
        ],
    },
];
