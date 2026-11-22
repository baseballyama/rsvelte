'use strict';

const { rulesByScope } = require('./configs.cjs');

const { eslintRules, svelteRules } = rulesByScope;

module.exports = { eslintRules, svelteRules };
