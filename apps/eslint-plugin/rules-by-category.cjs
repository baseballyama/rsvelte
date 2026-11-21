'use strict';

const { rulesByCategory } = require('./configs.cjs');

const {
	correctnessRules,
	suspiciousRules,
	pedanticRules,
	perfRules,
	styleRules,
	restrictionRules,
	nurseryRules,
} = rulesByCategory;

module.exports = {
	correctnessRules,
	suspiciousRules,
	pedanticRules,
	perfRules,
	styleRules,
	restrictionRules,
	nurseryRules,
};
