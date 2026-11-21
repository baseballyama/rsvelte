'use strict';

const { rulesByScope } = require('./configs.cjs');

const { eslintRules, typescriptRules, svelteRules, vueRules } = rulesByScope;

module.exports = { eslintRules, typescriptRules, svelteRules, vueRules };
