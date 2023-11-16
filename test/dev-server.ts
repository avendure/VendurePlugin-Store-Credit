import path from "path";
import {
  createTestEnvironment,
  registerInitializer,
  SqljsInitializer,
  testConfig,
} from "@vendure/testing";
import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { DefaultLogger, LogLevel, mergeConfig } from "@vendure/core";
import { StoreCreditPlugin } from "../src";
import { initialData } from "./fixtures/initial-data";
import { compileUiExtensions } from "@vendure/ui-devkit/compiler";

require("dotenv").config();

const run = async () => {
  registerInitializer("sqljs", new SqljsInitializer("__data__"));

  const devConfig = mergeConfig(testConfig, {
    logger: new DefaultLogger({ level: LogLevel.Debug }),
    plugins: [
      StoreCreditPlugin,
      AdminUiPlugin.init({
        port: 5002,
        app: compileUiExtensions({
          devMode: true,
          extensions: [StoreCreditPlugin.uiExtensions],
          outputPath: path.join(__dirname, "admin-ui"),
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
  const { server } = createTestEnvironment(devConfig);

  await server.init({
    initialData,
    productsCsvPath: path.join(__dirname, "fixtures/products.csv"),
    customerCount: 10,
  });
};

run();
