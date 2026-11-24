'use strict';

const { configs } = require('./configs.cjs');
const {
	buildFromOxlintConfig,
	buildFromOxlintConfigFile,
} = require('./build-from-oxlint-config.cjs');
// The release writes the version into the published manifest.
const { version } = /** @type {{ version: string }} */ (require('./package.json'));

module.exports = {
	meta: { name: '@rsvelte/eslint-plugin', version },
	configs,
	buildFromOxlintConfig,
	buildFromOxlintConfigFile,
};
