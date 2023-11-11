import {
	createTestEnvironment,
	registerInitializer,
	SqljsInitializer,
	testConfig,
} from "@vendure/testing";
import {
	DefaultLogger,
	DefaultSearchPlugin,
	LogLevel,
	mergeConfig,
} from "@vendure/core";
import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import path from "path";
import { StoreCreditPlugin } from "../src";
import { initialData } from "./initial-data";
import { compileUiExtensions } from "@vendure/ui-devkit/compiler";

require("dotenv").config();

(async () => {
	registerInitializer("sqljs", new SqljsInitializer("__data__"));
	const devConfig = mergeConfig(testConfig, {
		logger: new DefaultLogger({ level: LogLevel.Debug }),
		plugins: [
			AssetServerPlugin.init({
				assetUploadDir: path.join(__dirname, "__data__/assets"),
				route: "assets",
			}),
			StoreCreditPlugin,
			DefaultSearchPlugin,
			AdminUiPlugin.init({
				port: 3002,
				route: "admin",

				app: compileUiExtensions({
					outputPath: path.join(__dirname, "__admin-ui"),
					extensions: [StoreCreditPlugin.uiExtensions],
					devMode: true,
				}),
			}),
		],
		apiOptions: {
			shopApiPlayground: true,
			adminApiPlayground: true,
		},
	});
	const { server, adminClient, shopClient } = createTestEnvironment(devConfig);

	await server.init({
		initialData,
		customerCount: 5,
		productsCsvPath: "./products.csv",
	});
})();
