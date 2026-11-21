'use strict';

const { configs } = require('./configs.cjs');
// The release writes the version into the published manifest.
const { version } = /** @type {{ version: string }} */ (require('./package.json'));

module.exports = { meta: { name: '@rsvelte/eslint-plugin', version }, configs };
