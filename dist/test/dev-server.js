"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const testing_1 = require("@vendure/testing");
const admin_ui_plugin_1 = require("@vendure/admin-ui-plugin");
const core_1 = require("@vendure/core");
const src_1 = require("../src");
const initial_data_1 = require("./fixtures/initial-data");
const compiler_1 = require("@vendure/ui-devkit/compiler");
require("dotenv").config();
const run = async () => {
    (0, testing_1.registerInitializer)("sqljs", new testing_1.SqljsInitializer("__data__"));
    const devConfig = (0, core_1.mergeConfig)(testing_1.testConfig, {
        logger: new core_1.DefaultLogger({ level: core_1.LogLevel.Debug }),
        plugins: [
            src_1.StoreCreditPlugin,
            admin_ui_plugin_1.AdminUiPlugin.init({
                port: 5002,
                app: (0, compiler_1.compileUiExtensions)({
                    devMode: true,
                    extensions: [src_1.StoreCreditPlugin.uiExtensions],
                    outputPath: path_1.default.join(__dirname, "admin-ui"),
                }),
                route: "admin",
            }),
        ],
        authOptions: {
            tokenMethod: ["bearer", "cookie"],
        },
        apiOptions: {
            shopApiPlayground: true,
            adminApiPlayground: true,
        },
    });
    const { server } = (0, testing_1.createTestEnvironment)(devConfig);
    await server.init({
        initialData: initial_data_1.initialData,
        productsCsvPath: path_1.default.join(__dirname, "fixtures/products.csv"),
        customerCount: 10,
    });
};
run();
