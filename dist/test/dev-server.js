"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@vendure/testing");
const core_1 = require("@vendure/core");
const admin_ui_plugin_1 = require("@vendure/admin-ui-plugin");
const asset_server_plugin_1 = require("@vendure/asset-server-plugin");
const path_1 = __importDefault(require("path"));
const src_1 = require("../src");
const initial_data_1 = require("./initial-data");
const compiler_1 = require("@vendure/ui-devkit/compiler");
require("dotenv").config();
(async () => {
    (0, testing_1.registerInitializer)("sqljs", new testing_1.SqljsInitializer("__data__"));
    const devConfig = (0, core_1.mergeConfig)(testing_1.testConfig, {
        logger: new core_1.DefaultLogger({ level: core_1.LogLevel.Debug }),
        plugins: [
            asset_server_plugin_1.AssetServerPlugin.init({
                assetUploadDir: path_1.default.join(__dirname, "__data__/assets"),
                route: "assets",
            }),
            src_1.StoreCreditPlugin,
            core_1.DefaultSearchPlugin,
            admin_ui_plugin_1.AdminUiPlugin.init({
                port: 3002,
                route: "admin",
                app: (0, compiler_1.compileUiExtensions)({
                    outputPath: path_1.default.join(__dirname, "__admin-ui"),
                    extensions: [src_1.StoreCreditPlugin.uiExtensions],
                    devMode: true,
                }),
            }),
        ],
        apiOptions: {
            shopApiPlayground: true,
            adminApiPlayground: true,
        },
    });
    const { server, adminClient, shopClient } = (0, testing_1.createTestEnvironment)(devConfig);
    await server.init({
        initialData: initial_data_1.initialData,
        customerCount: 5,
        productsCsvPath: "./products.csv",
    });
})();
