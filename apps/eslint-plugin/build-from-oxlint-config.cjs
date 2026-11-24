// eslint-plugin-oxlint's `buildFromOxlintConfig`, for the rules rsvelte adds to oxlint: it reads
// the configuration as that plugin does, so the two turn off what `rsvelte lint` runs together.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { flat } = require('./configs.cjs');

/** @typedef {import('./configs.cjs').Rules} Rules */
/** @typedef {{ name: string, category: string }} Rule */

/** @type {{ rules: Rule[] }} */
const data = require('./rules.json');
const byName = new Map(data.rules.map((rule) => [rule.name, rule]));

/** @param {unknown} value */
const severity = (value) => (Array.isArray(value) ? value[0] : value);
/** @param {unknown} value */
const isOff = (value) => ['off', 'allow', 0].includes(/** @type {any} */ (severity(value)));
/** @param {unknown} value */
const isOn = (value) =>
	['error', 'deny', 'warn', 1, 2].includes(/** @type {any} */ (severity(value)));

/**
 * The rule of rsvelte an oxlint rule name names: `svelte/<rule>`, or a core rule, bare or as
 * `eslint/<rule>`.
 * @param {string} name
 */
function ruleOf(name) {
	if (name.startsWith('svelte/')) return byName.get(name);
	const core = name.startsWith('eslint/') ? name.slice('eslint/'.length) : name;
	return core.includes('/') ? undefined : byName.get(core);
}

/**
 * JSON with comments and trailing commas, as oxlint reads `.oxlintrc.json`.
 * @param {string} text
 */
function parseJsonc(text) {
	let out = '';
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (c === '"') {
			const end = /"((?:[^"\\]|\\.)*)"/y;
			end.lastIndex = i;
			const match = end.exec(text);
			if (!match) throw new SyntaxError('unterminated string');
			out += match[0];
			i += match[0].length - 1;
		} else if (c === '/' && text[i + 1] === '/') {
			while (i < text.length && text[i] !== '\n') i++;
			out += '\n';
		} else if (c === '/' && text[i + 1] === '*') {
			const end = text.indexOf('*/', i + 2);
			if (end === -1) throw new SyntaxError('unterminated comment');
			i = end + 1;
		} else out += c;
	}
	return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

/**
 * The configuration of `file`, with the paths it extends made absolute.
 * @param {string} file
 */
function read(file) {
	let config;
	try {
		config = parseJsonc(fs.readFileSync(file, 'utf8'));
	} catch (error) {
		throw new Error(`@rsvelte/eslint-plugin: could not read the oxlint configuration ${file}`, {
			cause: error,
		});
	}
	if (Array.isArray(config.extends))
		config.extends = config.extends.map((/** @type {unknown} */ entry) =>
			typeof entry === 'string' ? path.resolve(path.dirname(file), entry) : entry,
		);
	return config;
}

/**
 * The configurations `config` extends, innermost first, as eslint-plugin-oxlint flattens them:
 * their rules and overrides come before the configuration's own, and their categories are not
 * read.
 * @param {any} config
 * @returns {any[]}
 */
function extended(config) {
	if (!Array.isArray(config.extends)) return [];
	return config.extends.flatMap((/** @type {any} */ entry) => {
		const inner = typeof entry === 'string' ? read(entry) : entry;
		return [...extended(inner), inner];
	});
}

/**
 * Applies `rules` of an oxlint configuration to `off`: a rule on is turned off in ESLint, and a
 * rule off is left to ESLint.
 * @param {Record<string, unknown>} rules
 * @param {Rules} off
 * @param {boolean} withNursery
 */
function applyRules(rules, off, withNursery) {
	for (const [name, value] of Object.entries(rules)) {
		const rule = ruleOf(name);
		if (!rule || (rule.category === 'nursery' && !withNursery)) continue;
		if (isOn(value)) off[rule.name] = 'off';
		else if (isOff(value)) delete off[rule.name];
	}
}

/**
 * Flat configurations that turn off the rules an oxlint configuration has rsvelte run.
 * @param {any} config an object like the content of `.oxlintrc.json`
 * @param {{ withNursery?: boolean }} [options]
 */
function buildFromOxlintConfig(config, options = {}) {
	const withNursery = options.withNursery === true;
	const layers = [...extended(config), config];
	/** @type {Record<string, unknown>} */
	const categories = config.categories ?? { correctness: 'warn' };
	/** @type {Rules} */
	const off = {};
	for (const [category, value] of Object.entries(categories)) {
		if ((category === 'nursery' && !withNursery) || isOff(value)) continue;
		for (const rule of data.rules) if (rule.category === category) off[rule.name] = 'off';
	}
	for (const layer of layers) applyRules(layer.rules ?? {}, off, withNursery);
	/** @type {object[]} */
	const configs = flat('rsvelte/from-oxlint-config', off);
	const overrides = layers.flatMap((layer) =>
		Array.isArray(layer.overrides) ? layer.overrides : [],
	);
	for (const [index, override] of overrides.entries()) {
		/** @type {Rules} */
		const rules = {};
		applyRules(override.rules ?? {}, rules, withNursery);
		configs.push({
			name: `rsvelte/from-oxlint-config-override-${index}`,
			files: override.files,
			rules,
		});
	}
	if (Array.isArray(config.ignorePatterns))
		configs.unshift({
			name: 'rsvelte/oxlint-config-ignore-patterns',
			ignores: config.ignorePatterns,
		});
	return configs;
}

/**
 * {@link buildFromOxlintConfig} of the JSON or JSONC file at `file`.
 * @param {string} file
 * @param {{ withNursery?: boolean }} [options]
 */
const buildFromOxlintConfigFile = (file, options = {}) =>
	buildFromOxlintConfig(read(path.resolve(file)), options);

module.exports = { buildFromOxlintConfig, buildFromOxlintConfigFile };
