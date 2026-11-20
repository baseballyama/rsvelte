// Plain JavaScript: Node does not strip types from a file below node_modules.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @type {{ name: string, files: string[], rules: string[] }[]} */
const blocks = require('./rules.json');
// The release writes the version into the published manifest.
const { version } = /** @type {{ version: string }} */ (require('./package.json'));

const all = blocks.map(({ name, files, rules }) => ({
	name,
	files,
	rules: Object.fromEntries(rules.map((rule) => [rule, /** @type {const} */ ('off')])),
}));

export default {
	meta: { name: 'eslint-plugin-rsvelte', version },
	configs: { all },
};
