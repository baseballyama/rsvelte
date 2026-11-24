// CommonJS, so `require` and `import` share one copy. Node does not strip types below node_modules.
'use strict';

/** @typedef {{ name: string, scope: string, category: string, files: string }} Rule */
/** @typedef {Record<string, 'off'>} Rules */

/** @type {{ files: Record<string, string[]>, rules: Rule[] }} */
const data = require('./rules.json');

/** eslint-plugin-oxlint's scopes that rsvelte has rules in, and the ones it adds. */
const SCOPES = ['eslint', 'svelte'];
const CATEGORIES = [
	'correctness',
	'suspicious',
	'pedantic',
	'perf',
	'style',
	'restriction',
	'nursery',
];

/** @param {(rule: Rule) => boolean} keep @returns {Rules} */
const off = (keep) => Object.fromEntries(data.rules.filter(keep).map((rule) => [rule.name, 'off']));

/** @type {Record<string, Rules>} */
const rulesByScope = Object.fromEntries(
	SCOPES.map((scope) => [`${scope}Rules`, off((rule) => rule.scope === scope)]),
);
/** @type {Record<string, Rules>} */
const rulesByCategory = Object.fromEntries(
	CATEGORIES.map((category) => [`${category}Rules`, off((rule) => rule.category === category)]),
);

const filesOf = new Map(data.rules.map((rule) => [rule.name, rule.files]));

/**
 * One flat configuration per set of files: rsvelte runs each rule on some files only, and ESLint
 * keeps the rule on in the others.
 * @param {string} name
 * @param {Rules} rules
 */
function flat(name, rules) {
	/** @type {Map<string, Rules>} */
	const groups = new Map();
	for (const rule of Object.keys(rules)) {
		const label = /** @type {string} */ (filesOf.get(rule));
		groups.set(label, { ...groups.get(label), [rule]: 'off' });
	}
	return [...groups].map(([label, group]) => ({
		name: `${name}/${label}`,
		files: /** @type {string[]} */ (data.files[label]),
		rules: group,
	}));
}

/** The same rules for ESLint's legacy configuration (`.eslintrc`). @param {Rules} rules */
const legacy = (rules) => ({
	plugins: ['@rsvelte'],
	overrides: flat('', rules).map(({ files, rules: group }) => ({ files, rules: group })),
});

const { nurseryRules = {}, correctnessRules = {} } = rulesByCategory;
const allRules = off((rule) => !(rule.name in nurseryRules));

const configs = {
	recommended: legacy(correctnessRules),
	all: legacy(allRules),
	'flat/all': flat('rsvelte/all', allRules),
	'flat/recommended': flat('rsvelte/recommended', correctnessRules),
	...Object.fromEntries(
		SCOPES.map((scope) => [
			`flat/${scope}`,
			flat(`rsvelte/${scope}`, rulesByScope[`${scope}Rules`] ?? {}),
		]),
	),
	...Object.fromEntries(
		CATEGORIES.map((category) => [
			`flat/${category}`,
			flat(`rsvelte/${category}`, rulesByCategory[`${category}Rules`] ?? {}),
		]),
	),
};

module.exports = { configs, rulesByScope, rulesByCategory, flat };
