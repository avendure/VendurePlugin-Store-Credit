"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
const core_2 = require("@vendure/admin-ui/core");
const app_module_1 = require("./app.module");
const environment_1 = require("./environment");
if (environment_1.environment.production) {
    (0, core_1.enableProdMode)();
}
(0, core_2.loadAppConfig)()
    .then(() => (0, platform_browser_dynamic_1.platformBrowserDynamic)().bootstrapModule(app_module_1.AppModule))
    .catch((err) => {
    /* eslint-disable no-console */
    console.log(err);
});
