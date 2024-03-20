import path from 'path';
import { createTestEnvironment, registerInitializer, SqljsInitializer } from '@vendure/testing';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { DefaultLogger, DefaultSearchPlugin, LogLevel, mergeConfig } from '@vendure/core';
import { StoreCreditPlugin } from '../src';
import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import { initialData } from './fixtures/initial-data';

(async () => {
    require('dotenv').config();
    const { testConfig } = require('@vendure/testing');
    registerInitializer('sqljs', new SqljsInitializer('__data__'));
    const config = mergeConfig(testConfig, {
        logger: new DefaultLogger({ level: LogLevel.Debug }),
        authOptions: {
            tokenMethod: ['bearer', 'cookie'],
            cookieOptions: {
                secret: '123',
            },
        },
        dbConnectionOptions: {
            synchronize: false,
        },
        apiOptions: {
            adminApiPlayground: true,
            shopApiPlayground: true,
        },
        plugins: [
            DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
            StoreCreditPlugin.init({
                npp: { name: 'Store credits', slug: 'store-credits' },
                platformFee: { type: 'percent', value: 0.01 },
                creditToCurrencyFactor: { default: 1, USD: 2, NPR: 1, AMD: 0.5 },
                isFraction: true,
            }),
            AdminUiPlugin.init({
                port: 5002,
                route: 'admin',
                app: compileUiExtensions({
                    devMode: true,
                    extensions: [StoreCreditPlugin.uiExtensions],
                    outputPath: path.join(__dirname, 'admin-ui'),
                }),
            }),
        ],
    });
    const { server } = createTestEnvironment(config);
    await server.init({
        initialData,
        productsCsvPath: path.join(__dirname, 'fixtures/products.csv'),
    });
})();
